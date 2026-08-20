import { prisma } from '../db';
import { currencyService } from '../currency/currency-service';
import type { PriceQuote, PricingCustomerContext } from '@/shared/types/pricing';

export interface ProductPricingInput {
  id: string;
  sku: string;
  name?: string;
  salePrice: number | null;
  currency: string;
  vatRate: number;
  brandId?: string | null;
  categoryId?: string | null;
}

export const pricingService = {
  /**
   * Tek bir ürün ve müşteri bağlamı için B2B fiyat hesaplama motoru.
   */
  async calculatePrice(
    product: ProductPricingInput,
    customer?: PricingCustomerContext | null,
    quantity: number = 1,
    targetCurrency: string = 'TRY'
  ): Promise<PriceQuote> {
    const qty = Math.max(1, quantity);
    const baseCurrency = (product.currency || 'TRY').toUpperCase();
    const displayCur = targetCurrency.toUpperCase();
    const rawSalePrice = product.salePrice ?? 0;
    const vatRateNum = product.vatRate ?? 20;

    // 1. Döviz çevrimi (Kaynak para biriminden Hedef para birimine)
    const { convertedAmount: basePriceInTarget, fxRate, fetchedAt } = await currencyService.convert(
      rawSalePrice,
      baseCurrency,
      displayCur
    );

    let finalUnitPriceNet = basePriceInTarget;
    let appliedRuleIds: string[] = [];
    let appliedRuleNames: string[] = [];

    // 2. Eğer müşteri bağlamı varsa (Giriş yapmış B2B müşterisi/şirket), fiyat kurallarını çek
    if (customer && (customer.companyId || customer.customerGroupId)) {
      const now = new Date();

      const activeRules = await prisma.priceRule.findMany({
        where: {
          active: true,
          OR: [
            customer.companyId ? { companyId: customer.companyId } : {},
            customer.customerGroupId ? { customerGroupId: customer.customerGroupId } : {},
          ],
          AND: [
            { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
            { OR: [{ validTo: null }, { validTo: { gte: now } }] },
          ],
        },
        orderBy: { priority: 'asc' }, // Önceliğe göre sıralı (1 = En yüksek)
      });

      // Hiyerarşik Eşleşme Kontrolü:
      for (const rule of activeRules) {
        let isMatch = false;

        // 1. Müşteri + Ürün Özel Fiyatı
        if (rule.type === 'CUSTOMER_PRODUCT' && rule.companyId === customer.companyId && rule.productId === product.id) {
          isMatch = true;
        }
        // 2. Grup + Ürün Özel Fiyatı
        else if (rule.type === 'GROUP_PRODUCT' && rule.customerGroupId === customer.customerGroupId && rule.productId === product.id) {
          isMatch = true;
        }
        // 3. Grup + Marka İndirimi
        else if (rule.type === 'GROUP_BRAND' && rule.customerGroupId === customer.customerGroupId && rule.brandId && rule.brandId === product.brandId) {
          isMatch = true;
        }
        // 4. Grup + Kategori İndirimi
        else if (rule.type === 'GROUP_CATEGORY' && rule.customerGroupId === customer.customerGroupId && rule.categoryId && rule.categoryId === product.categoryId) {
          isMatch = true;
        }
        // 5. Grup Genel İndirim Yüzdesi
        else if (rule.type === 'GROUP_PERCENT' && rule.customerGroupId === customer.customerGroupId) {
          isMatch = true;
        }
        // 6. Miktar Kademeli İndirim
        else if (rule.type === 'QTY_TIER' && rule.minQty && qty >= rule.minQty) {
          if (rule.productId && rule.productId === product.id) isMatch = true;
          else if (rule.customerGroupId && rule.customerGroupId === customer.customerGroupId) isMatch = true;
        }

        if (isMatch) {
          if (rule.specialPrice !== null && rule.specialPrice !== undefined) {
            // Doğrudan özel net fiyat
            const specPriceNum = Number(rule.specialPrice);
            // Özel fiyat TRY ise ve hedef para birimi farklıysa çevir
            const convertedSpec = await currencyService.convert(specPriceNum, 'TRY', displayCur);
            finalUnitPriceNet = convertedSpec.convertedAmount;
          } else if (rule.discountPercent !== null && rule.discountPercent !== undefined) {
            // Yüzdesel indirim uygula
            const disc = Number(rule.discountPercent);
            finalUnitPriceNet = Number((basePriceInTarget * (1 - disc / 100)).toFixed(2));
          }

          appliedRuleIds.push(rule.id);
          appliedRuleNames.push(rule.name);
          break; // En yüksek öncelikli ilk kural uygulandıktan sonra sonlandır
        }
      }
    }

    // 3. KDV ve Satır Toplamı Hesaplamaları
    const lineNetExVat = Number((finalUnitPriceNet * qty).toFixed(2));
    const vatAmount = Number((lineNetExVat * (vatRateNum / 100)).toFixed(2));
    const lineGross = Number((lineNetExVat + vatAmount).toFixed(2));

    const currencySymbol = displayCur === 'EUR' ? '€' : displayCur === 'USD' ? '$' : '₺';
    const formattedNet = finalUnitPriceNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const vatExcludedLabel = `${formattedNet} ${currencySymbol} + KDV`;

    return {
      productId: product.id,
      sku: product.sku,
      quantity: qty,
      sourceCurrency: baseCurrency,
      displayCurrency: displayCur,
      fxRate,
      fxFetchedAt: fetchedAt.toISOString(),
      listUnitNetExVat: basePriceInTarget,
      unitNetExVat: finalUnitPriceNet,
      lineNetExVat,
      vatRate: vatRateNum,
      vatAmount,
      lineGross,
      appliedRuleIds,
      appliedRuleNames,
      vatExcludedLabel,
    };
  },

  /**
   * Katalog ve liste sayfaları için toplu fiyat hesaplama.
   */
  async calculateBatch(
    products: ProductPricingInput[],
    customer?: PricingCustomerContext | null,
    targetCurrency: string = 'TRY'
  ): Promise<Map<string, PriceQuote>> {
    const quotes = new Map<string, PriceQuote>();
    for (const p of products) {
      const quote = await this.calculatePrice(p, customer, 1, targetCurrency);
      quotes.set(p.id, quote);
    }
    return quotes;
  }
};
