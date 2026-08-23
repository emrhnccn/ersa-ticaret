import { prisma } from '../db';
import { pricingService } from '../pricing/pricing-service';
import { currentAccountService } from '../current-account/current-account-service';
import { getPaymentGateway } from '@/integrations/payment/factory';
import { birFaturaAdapter } from '@/integrations/invoicing/birfatura/adapter';
import { shippingAdapter } from '@/integrations/shipping/adapter';
import { recordAuditLog } from '../audit/audit-service';
import { notificationService } from '../notifications/notification-service';
import type { PricingCustomerContext } from '@/shared/types/pricing';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderParams {
  userId?: string | null;
  companyId?: string | null;
  items: OrderItemInput[];
  paymentMethod: 'CREDIT_CARD' | 'CURRENT_ACCOUNT';
  currency?: string;
  address: {
    line1: string;
    city: string;
    district?: string;
    title?: string;
    recipientName: string;
    recipientPhone: string;
    taxNo?: string;
    taxOffice?: string;
  };
  notes?: string;
  actorId?: string | null;
}

export const orderService = {
  async createOrder(params: CreateOrderParams) {
    if (!params.items || params.items.length === 0) {
      throw new Error('Sipariş sepeti boş olamaz.');
    }

    const currency = (params.currency || 'TRY').toUpperCase();
    const customerContext: PricingCustomerContext | null = params.companyId || params.userId ? {
      userId: params.userId || undefined,
      companyId: params.companyId || undefined,
    } : null;

    if (params.companyId && !customerContext?.customerGroupId) {
      const comp = await prisma.company.findUnique({ where: { id: params.companyId } });
      if (comp?.customerGroupId) customerContext!.customerGroupId = comp.customerGroupId;
    }

    // 1. Ürünleri DB'den çek ve fiyatları GÜVENLİ şekilde backend'de hesapla
    let subtotalExVat = 0;
    let vatTotal = 0;
    let grandTotal = 0;
    let fxRateUsed = 1;
    let fxBaseUsed = 'TRY';
    const orderItemsData: any[] = [];
    const itemsSummaryList: string[] = [];

    for (const item of params.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { brand: true, category: true },
      });

      if (!product) {
        throw new Error(`Ürün bulunamadı (ID: ${item.productId})`);
      }

      if (Number(product.stockQty) < item.quantity) {
        throw new Error(`"${product.name}" ürünü için yetersiz stok! Mevcut stok: ${product.stockQty}`);
      }

      // Pricing engine ile doğrulanmış fiyat hesapla
      const quote = await pricingService.calculatePrice(
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          currency: product.currency,
          vatRate: Number(product.vatRate),
          brandId: product.brandId,
          categoryId: product.categoryId,
        },
        customerContext,
        item.quantity,
        currency
      );

      subtotalExVat += quote.lineNetExVat;
      vatTotal += quote.vatAmount;
      grandTotal += quote.lineGross;
      fxRateUsed = quote.fxRate;
      fxBaseUsed = quote.sourceCurrency;

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit: product.unit || 'ADET',
        currency,
        fxRate: fxRateUsed,
        unitNetExVat: quote.unitNetExVat,
        discountAmt: 0,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        lineGross: quote.lineGross,
        appliedRules: JSON.stringify(quote.appliedRuleNames),
      });

      itemsSummaryList.push(`• ${product.name} (x${item.quantity}) - ${(quote.lineGross).toLocaleString('tr-TR')} ${currency}`);
    }

    subtotalExVat = Number(subtotalExVat.toFixed(2));
    vatTotal = Number(vatTotal.toFixed(2));
    grandTotal = Number(grandTotal.toFixed(2));

    // 2. B2B Cari Hesap ödemesi ise Limit Kontrolü
    let companyLegalName: string | null = null;
    if (params.paymentMethod === 'CURRENT_ACCOUNT') {
      if (!params.companyId) {
        throw new Error('Cari hesap ile ödeme yapabilmek için kurumsal şirket hesabı gereklidir.');
      }
      const cariSummary = await currentAccountService.getAccount(params.companyId);
      companyLegalName = cariSummary.companyName;
      if (cariSummary.availableLimit < grandTotal) {
        throw new Error(
          `Cari limitiniz bu sipariş için yetersizdir. Kalan kullanılabilir limit: ${cariSummary.availableLimit.toLocaleString('tr-TR')} ₺, Sipariş Tutarı: ${grandTotal.toLocaleString('tr-TR')} ₺`
        );
      }
    }

    // 3. Sipariş Numarası Üret
    const orderNo = `ERS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 4. Siparişi ve Adresi Transaction ile kaydet (Cari ödeme durumunda PENDING_APPROVAL)
    const initialStatus = params.paymentMethod === 'CURRENT_ACCOUNT' ? 'PENDING_APPROVAL' : 'PAYMENT_PENDING';

    const order = await prisma.$transaction(async (tx) => {
      // Adres kaydı
      const address = await tx.address.create({
        data: {
          userId: params.userId || null,
          companyId: params.companyId || null,
          title: params.address.title || 'Teslimat Adresi',
          line1: params.address.line1,
          city: params.address.city,
          district: params.address.district || null,
        }
      });

      // Sipariş
      const createdOrder = await tx.order.create({
        data: {
          orderNo,
          userId: params.userId || null,
          companyId: params.companyId || null,
          buyerType: params.companyId ? 'B2B' : 'B2C',
          status: initialStatus,
          addressId: address.id,
          currency,
          fxBase: fxBaseUsed,
          fxRate: fxRateUsed,
          fxFetchedAt: new Date(),
          subtotalExVat,
          vatTotal,
          grandTotal,
          paymentMethod: params.paymentMethod,
          notes: params.notes || null,
          items: {
            create: orderItemsData,
          }
        },
        include: { items: true, address: true, company: true, user: true }
      });

      // Stokları düşür / rezerve et
      for (const item of params.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } }
        });
      }

      return createdOrder;
    });

    await recordAuditLog({
      actorId: params.actorId || params.userId,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      afterJson: JSON.stringify({ orderNo, grandTotal, paymentMethod: params.paymentMethod, status: initialStatus }),
    });

    // 5. Bildirimleri Gönder (E-Posta & WhatsApp)
    const notifData = {
      orderId: order.id,
      orderNo: order.orderNo,
      recipientName: params.address.recipientName,
      recipientPhone: params.address.recipientPhone,
      recipientEmail: order.user?.email || order.company?.email,
      companyName: order.company?.legalName || companyLegalName,
      grandTotal,
      currency,
      paymentMethod: params.paymentMethod,
      status: initialStatus,
      itemCount: params.items.length,
      itemsSummary: itemsSummaryList.join('<br>'),
      addressSummary: `${params.address.line1}, ${params.address.district ? params.address.district + '/' : ''}${params.address.city}`,
    };

    try {
      await notificationService.sendOrderEmail(notifData, 'CREATED');
      await notificationService.sendOrderWhatsApp(notifData, 'CREATED');
    } catch (notifErr: any) {
      console.warn('[Order Notification Warning]:', notifErr.message);
    }

    // 6. Cari Hesap İse Yönetici Onayına Beklet
    if (params.paymentMethod === 'CURRENT_ACCOUNT') {
      return {
        order,
        paymentUrl: null,
        status: 'PENDING_APPROVAL',
        message: 'Siparişiniz cari hesap ile oluşturulmuştur. Yönetici onayının ardından hazırlanmaya başlanacaktır.',
      };
    }

    // 7. Kredi Kartı İse Sanal POS Ödeme Başlat
    if (params.paymentMethod === 'CREDIT_CARD') {
      const pos = getPaymentGateway();
      const posResponse = await pos.initiatePayment({
        orderId: order.id,
        companyId: params.companyId,
        userId: params.userId,
        purpose: 'ORDER',
        amount: grandTotal,
        currency,
        customerName: params.address.recipientName,
        customerEmail: order.user?.email || 'musteri@ersaticaret.com',
        customerPhone: params.address.recipientPhone,
        billingAddress: {
          line1: params.address.line1,
          city: params.address.city,
          district: params.address.district,
        },
        callbackUrl: `/api/v1/payments/callback`,
      });

      return {
        order,
        paymentUrl: posResponse.redirectUrl,
        paymentId: posResponse.paymentId,
        status: 'PAYMENT_PENDING',
        message: 'Ödeme ekranına yönlendiriliyorsunuz...',
      };
    }

    return { order, status: order.status };
  },

  /**
   * Yönetici Cari Siparişini Onaylar
   */
  async approveOrder(orderId: string, adminUserId?: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNo: orderId }
        ]
      },
      include: { items: true, address: true, company: true, user: true },
    });

    if (!order) {
      console.error(`[Approve Order Error] Order not found for identifier: ${orderId}`);
      throw new Error(`Sipariş bulunamadı. (Sipariş ID / No: ${orderId})`);
    }

    if (order.status !== 'PENDING_APPROVAL') {
      throw new Error(`Sipariş durumu onaya uygun değil. Mevcut durum: ${order.status}`);
    }

    const grandTotal = Number(order.grandTotal);

    // 1. Cari Deftere Borç Yaz
    if (order.companyId) {
      await currentAccountService.recordTransaction({
        companyId: order.companyId,
        type: 'DEBIT',
        amount: grandTotal,
        orderId: order.id,
        note: `Sipariş #${order.orderNo} Yönetici Onaylı Cari Borç Kaydı`,
        actorId: adminUserId,
      });
    }

    // 2. Sipariş Durumunu PROCESSING yap
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
      include: { items: true, address: true, company: true, user: true },
    });

    // 3. Otomatik e-Fatura ve Kargo
    try {
      if (order.address) {
        await birFaturaAdapter.createInvoice({
          orderId: order.id,
          orderNo: order.orderNo,
          buyerName: order.company?.legalName || order.user?.name || 'Müşteri',
          taxNo: order.company?.taxNo,
          taxOffice: order.company?.taxOffice,
          email: order.company?.email || order.user?.email || '',
          address: order.address.line1,
          city: order.address.city,
          items: order.items.map(i => ({
            name: i.name,
            sku: i.sku,
            quantity: Number(i.quantity),
            unitPriceExVat: Number(i.unitNetExVat),
            vatRate: Number(i.vatRate),
            vatAmount: Number(i.vatAmount),
            totalGross: Number(i.lineGross),
          })),
          subtotalExVat: Number(order.subtotalExVat),
          vatTotal: Number(order.vatTotal),
          grandTotal: Number(order.grandTotal),
          currency: order.currency,
        });

        await shippingAdapter.createShipment({
          orderId: order.id,
          recipientName: order.company?.legalName || order.user?.name || 'Alıcı',
          recipientPhone: order.user?.phone || order.company?.phone || '05525843073',
          address: order.address.line1,
          city: order.address.city,
          district: order.address.district || undefined,
        });
      }
    } catch (e: any) {
      console.warn('[Invoice/Shipping Auto Trigger Notice]:', e.message);
    }

    // 4. Onay Bildirimi Gönder
    const notifData = {
      orderId: order.id,
      orderNo: order.orderNo,
      recipientName: order.user?.name || order.company?.legalName || 'Müşteri',
      recipientPhone: order.user?.phone || order.company?.phone,
      recipientEmail: order.user?.email || order.company?.email,
      companyName: order.company?.legalName,
      grandTotal,
      currency: order.currency,
      paymentMethod: order.paymentMethod || 'CURRENT_ACCOUNT',
      status: 'PROCESSING',
      itemCount: order.items.length,
      itemsSummary: order.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
      addressSummary: order.address ? `${order.address.line1}, ${order.address.city}` : '',
    };

    try {
      await notificationService.sendOrderEmail(notifData, 'APPROVED');
      await notificationService.sendOrderWhatsApp(notifData, 'APPROVED');
    } catch {}

    await recordAuditLog({
      actorId: adminUserId,
      action: 'ORDER_APPROVED_BY_ADMIN',
      entityType: 'Order',
      entityId: order.id,
      afterJson: JSON.stringify({ orderNo: order.orderNo, status: 'PROCESSING' }),
    });

    return updatedOrder;
  },

  /**
   * Yönetici Siparişi Reddeder
   */
  async rejectOrder(orderId: string, adminUserId?: string, reason?: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNo: orderId }
        ]
      },
      include: { items: true, company: true, user: true },
    });

    if (!order) {
      console.error(`[Reject Order Error] Order not found for identifier: ${orderId}`);
      throw new Error(`Sipariş bulunamadı. (Sipariş ID / No: ${orderId})`);
    }

    // Stokları iade et
    for (const item of order.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } }
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    await recordAuditLog({
      actorId: adminUserId,
      action: 'ORDER_REJECTED_BY_ADMIN',
      entityType: 'Order',
      entityId: order.id,
      afterJson: JSON.stringify({ orderNo: order.orderNo, status: 'CANCELLED', reason }),
    });

    return updatedOrder;
  },

  async completePaidOrder(orderId: string, paymentRef: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: { items: true, address: true, user: true, company: true }
    });

    // Fatura kes
    await birFaturaAdapter.createInvoice({
      orderId: order.id,
      orderNo: order.orderNo,
      buyerName: order.company?.legalName || order.user?.name || 'Müşteri',
      taxNo: order.company?.taxNo,
      taxOffice: order.company?.taxOffice,
      email: order.company?.email || order.user?.email || '',
      address: order.address?.line1 || '',
      city: order.address?.city || '',
      items: order.items.map(i => ({
        name: i.name,
        sku: i.sku,
        quantity: Number(i.quantity),
        unitPriceExVat: Number(i.unitNetExVat),
        vatRate: Number(i.vatRate),
        vatAmount: Number(i.vatAmount),
        totalGross: Number(i.lineGross),
      })),
      subtotalExVat: Number(order.subtotalExVat),
      vatTotal: Number(order.vatTotal),
      grandTotal: Number(order.grandTotal),
      currency: order.currency,
    });

    // Kargo etiketi oluştur
    if (order.address) {
      await shippingAdapter.createShipment({
        orderId: order.id,
        recipientName: order.company?.legalName || order.user?.name || 'Alıcı',
        recipientPhone: order.user?.phone || order.company?.phone || '05525843073',
        address: order.address.line1,
        city: order.address.city,
        district: order.address.district || undefined,
      });
    }

    await recordAuditLog({
      action: 'ORDER_PAID_COMPLETED',
      entityType: 'Order',
      entityId: order.id,
      afterJson: JSON.stringify({ paymentRef, status: 'PAID' }),
    });

    return order;
  },

  async getCustomerOrders(userId?: string, companyId?: string) {
    return prisma.order.findMany({
      where: {
        OR: [
          companyId ? { companyId } : {},
          userId ? { userId } : {},
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              }
            }
          }
        },
        invoices: true,
        shipments: true,
        address: true,
      }
    });
  }
};
