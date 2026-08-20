import { prisma } from '../db';
import { pricingService } from '../pricing/pricing-service';
import { currentAccountService } from '../current-account/current-account-service';
import { getPaymentGateway } from '@/integrations/payment/factory';
import { birFaturaAdapter } from '@/integrations/invoicing/birfatura/adapter';
import { shippingAdapter } from '@/integrations/shipping/adapter';
import { recordAuditLog } from '../audit/audit-service';
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
        unit: product.unit,
        currency,
        fxRate: quote.fxRate,
        unitNetExVat: quote.unitNetExVat,
        discountAmt: Number((quote.listUnitNetExVat - quote.unitNetExVat).toFixed(2)),
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        lineGross: quote.lineGross,
        appliedRules: JSON.stringify(quote.appliedRuleNames),
      });
    }

    subtotalExVat = Number(subtotalExVat.toFixed(2));
    vatTotal = Number(vatTotal.toFixed(2));
    grandTotal = Number(grandTotal.toFixed(2));

    // 2. B2B Cari Hesap ödemesi ise Limit Kontrolü
    if (params.paymentMethod === 'CURRENT_ACCOUNT') {
      if (!params.companyId) {
        throw new Error('Cari hesap ile ödeme yapabilmek için kurumsal şirket hesabı gereklidir.');
      }
      const cariSummary = await currentAccountService.getAccount(params.companyId);
      if (cariSummary.availableLimit < grandTotal) {
        throw new Error(
          `Cari limitiniz bu sipariş için yetersizdir. Kalan kullanılabilir limit: ${cariSummary.availableLimit.toLocaleString('tr-TR')} ₺, Sipariş Tutarı: ${grandTotal.toLocaleString('tr-TR')} ₺`
        );
      }
    }

    // 3. Sipariş Numarası Üret
    const orderNo = `ERS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 4. Siparişi ve Adresi Transaction ile kaydet
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
          status: params.paymentMethod === 'CURRENT_ACCOUNT' ? 'PROCESSING' : 'PAYMENT_PENDING',
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
        include: { items: true, address: true }
      });

      // Stokları düşür
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
      afterJson: JSON.stringify({ orderNo, grandTotal, paymentMethod: params.paymentMethod }),
    });

    // 5. Cari Hesap İse Deftere Borç Yaz ve Otomatik Fatura/Kargo Oluştur
    if (params.paymentMethod === 'CURRENT_ACCOUNT' && params.companyId) {
      await currentAccountService.recordTransaction({
        companyId: params.companyId,
        type: 'DEBIT',
        amount: grandTotal,
        orderId: order.id,
        note: `Sipariş #${order.orderNo} Cari Borç Kaydı`,
        actorId: params.actorId || params.userId,
      });

      // Otomatik e-Fatura oluştur
      await birFaturaAdapter.createInvoice({
        orderId: order.id,
        orderNo: order.orderNo,
        buyerName: params.address.recipientName,
        taxNo: params.address.taxNo,
        taxOffice: params.address.taxOffice,
        email: params.userId ? 'musteri@ersaticaret.com' : 'misafir@ersaticaret.com',
        address: params.address.line1,
        city: params.address.city,
        items: order.items.map(i => ({
          name: i.name,
          sku: i.sku,
          quantity: Number(i.quantity),
          unitPriceExVat: Number(i.unitNetExVat),
          vatRate: Number(i.vatRate),
          vatAmount: Number(i.vatAmount),
          totalGross: Number(i.lineGross),
        })),
        subtotalExVat,
        vatTotal,
        grandTotal,
        currency,
      });

      // Otomatik Kargo oluştur
      await shippingAdapter.createShipment({
        orderId: order.id,
        recipientName: params.address.recipientName,
        recipientPhone: params.address.recipientPhone,
        address: params.address.line1,
        city: params.address.city,
        district: params.address.district,
      });

      return {
        order,
        paymentUrl: null,
        status: 'PROCESSING',
        message: 'Siparişiniz cari hesabınızdan onaylanmış ve hazırlanmaya başlanmıştır.',
      };
    }

    // 6. Kredi Kartı İse Sanal POS Ödeme Başlat
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
        customerEmail: 'musteri@ersaticaret.com',
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
        items: true,
        invoices: true,
        shipments: true,
        address: true,
      }
    });
  }
};
