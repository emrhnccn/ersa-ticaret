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
   * Müşteri için aktif B2B fiyat kurallarını tek seferde çeker.
   */
  async getCustomerActiveRules(customer?: PricingCustomerContext | null) {
    const now = new Date();
    const orConditions: any[] = [{ companyId: null, customerGroupId: null }];
    
    if (customer?.companyId) {
      orConditions.push({ companyId: customer.companyId });
    }
    if (customer?.customerGroupId) {
      orConditions.push({ customerGroupId: customer.customerGroupId });
    }

    try {
      return await prisma.priceRule.findMany({
        where: {
          active: true,
          OR: orConditions,
          AND: [
            { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
            { OR: [{ validTo: null }, { validTo: { gte: now } }] },
          ],
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (e) {
      console.warn('DB Price rules fetch fallback in pricing-service:', e);
      return [];
    }
  },

  /**
   * Toplu Ürün Fiyatlandırma Motoru (Zero N+1 Query).
   * 24-100 ürünü tek bir DB sorgusu ile bellek içinde anında hesaplar.
   */
  async calculateBatch(
    products: ProductPricingInput[],
    customer?: PricingCustomerContext | null,
    targetCurrency: string = 'TRY',
    quantity: number = 1
  ): Promise<Map<string, PriceQuote>> {
    const quotes = new Map<string, PriceQuote>();
    if (products.length === 0) return quotes;

    const displayCur = targetCurrency.toUpperCase();
    const activeRules = await this.getCustomerActiveRules(customer);

    // İhtiyaç duyulan döviz kurlarını tek seferde önbelleğe al
    const distinctCurrencies = Array.from(new Set(products.map(p => (p.currency || 'TRY').toUpperCase())));
    const fxRates = new Map<string, { rate: number; fetchedAt: string }>();

    for (const cur of distinctCurrencies) {
      const { rate, fetchedAt } = await currencyService.getExchangeRate(cur, displayCur);
      fxRates.set(cur, { rate, fetchedAt: fetchedAt.toISOString() });
    }

    for (const product of products) {
      const baseCurrency = (product.currency || 'TRY').toUpperCase();
      const rawSalePrice = product.salePrice ?? 0;
      const vatRateNum = product.vatRate ?? 20;

      const fxInfo = fxRates.get(baseCurrency) || { rate: 1, fetchedAt: new Date().toISOString() };
      const basePriceInTarget = Number((rawSalePrice * fxInfo.rate).toFixed(2));

      let finalUnitPriceNet = basePriceInTarget;
      const appliedRuleIds: string[] = [];
      const appliedRuleNames: string[] = [];

      // Bellek içi 1-7 Öncelik Sıralamasına Göre Kural Eşleştirme
      for (const rule of activeRules) {
        let isMatch = false;

        // 1. CUSTOMER_PRODUCT (Firma + Ürün Net Fiyat / İskonto)
        if (rule.type === 'CUSTOMER_PRODUCT' && rule.companyId && rule.companyId === customer?.companyId && rule.productId === product.id) {
          isMatch = true;
        }
        // 2. CUSTOMER_CATEGORY (Firma + Kategori İskontosu)
        else if (rule.type === 'CUSTOMER_CATEGORY' && rule.companyId && rule.companyId === customer?.companyId && rule.categoryId && rule.categoryId === product.categoryId) {
          isMatch = true;
        }
        // 3. CUSTOMER_BRAND (Firma + Marka İskontosu)
        else if (rule.type === 'CUSTOMER_BRAND' && rule.companyId && rule.companyId === customer?.companyId && rule.brandId && rule.brandId === product.brandId) {
          isMatch = true;
        }
        // 4. CUSTOMER_PERCENT (Firma Genel Cari İskontosu)
        else if (rule.type === 'CUSTOMER_PERCENT' && rule.companyId && rule.companyId === customer?.companyId) {
          isMatch = true;
        }
        // 5. GROUP_PRODUCT (Müşteri Grubu + Ürün İskontosu)
        else if (rule.type === 'GROUP_PRODUCT' && rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId && rule.productId === product.id) {
          isMatch = true;
        }
        // 6. GROUP_CATEGORY (Müşteri Grubu + Kategori İskontosu)
        else if (rule.type === 'GROUP_CATEGORY' && rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId && rule.categoryId && rule.categoryId === product.categoryId) {
          isMatch = true;
        }
        // 7. GROUP_BRAND (Müşteri Grubu + Marka İskontosu)
        else if (rule.type === 'GROUP_BRAND' && rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId && rule.brandId && rule.brandId === product.brandId) {
          isMatch = true;
        }
        // 8. GROUP_PERCENT (Müşteri Grubu Genel İskontosu)
        else if (rule.type === 'GROUP_PERCENT' && rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId) {
          isMatch = true;
        }
        // 9. QTY_TIER (Miktar Kademeli İskonto)
        else if (rule.type === 'QTY_TIER') {
          const qtyMatched = !rule.minQty || quantity >= rule.minQty;
          const companyMatched = !rule.companyId || rule.companyId === customer?.companyId;
          const groupMatched = !rule.customerGroupId || rule.customerGroupId === customer?.customerGroupId;
          const prodMatched = !rule.productId || rule.productId === product.id;
          const catMatched = !rule.categoryId || rule.categoryId === product.categoryId;
          if (qtyMatched && companyMatched && groupMatched && prodMatched && catMatched) {
            isMatch = true;
          }
        }
        // 10. CATEGORY_CAMPAIGN (Genel Kategori İndirimi)
        else if ((rule.type === 'CATEGORY_CAMPAIGN' || (!rule.companyId && !rule.customerGroupId && rule.categoryId)) && rule.categoryId === product.categoryId) {
          isMatch = true;
        }
        // 11. BRAND_CAMPAIGN (Genel Marka İndirimi)
        else if ((rule.type === 'BRAND_CAMPAIGN' || (!rule.companyId && !rule.customerGroupId && rule.brandId)) && rule.brandId === product.brandId) {
          isMatch = true;
        }
        // Genel Kapsamlı Firma Eşleştirmesi (Firma seçili kurallar)
        else if (rule.companyId && rule.companyId === customer?.companyId) {
          if (rule.productId && rule.productId === product.id) isMatch = true;
          else if (rule.categoryId && rule.categoryId === product.categoryId) isMatch = true;
          else if (rule.brandId && rule.brandId === product.brandId) isMatch = true;
          else if (!rule.productId && !rule.categoryId && !rule.brandId) isMatch = true;
        }
        // Genel Kapsamlı Müşteri Grubu Eşleştirmesi
        else if (rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId) {
          if (rule.productId && rule.productId === product.id) isMatch = true;
          else if (rule.categoryId && rule.categoryId === product.categoryId) isMatch = true;
          else if (rule.brandId && rule.brandId === product.brandId) isMatch = true;
          else if (!rule.productId && !rule.categoryId && !rule.brandId) isMatch = true;
        }

        if (isMatch) {
          if (rule.specialPrice !== null && rule.specialPrice !== undefined && Number(rule.specialPrice) > 0) {
            const specPriceNum = Number(rule.specialPrice);
            const tryFx = fxRates.get('TRY') || { rate: 1 };
            finalUnitPriceNet = Number((specPriceNum * tryFx.rate).toFixed(2));
          } else if (rule.discountPercent !== null && rule.discountPercent !== undefined && Number(rule.discountPercent) > 0) {
            const disc = Number(rule.discountPercent);
            finalUnitPriceNet = Number((basePriceInTarget * (1 - disc / 100)).toFixed(2));
          }

          appliedRuleIds.push(rule.id);
          appliedRuleNames.push(rule.name);
          break; // En yüksek öncelikli kural uygulandıktan sonra dur
        }
      }

      const lineNetExVat = Number((finalUnitPriceNet * quantity).toFixed(2));
      const vatAmount = Number((lineNetExVat * (vatRateNum / 100)).toFixed(2));
      const lineGross = Number((lineNetExVat + vatAmount).toFixed(2));

      const currencySymbol = displayCur === 'EUR' ? '€' : displayCur === 'USD' ? '$' : '₺';
      const formattedNet = finalUnitPriceNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const vatExcludedLabel = `${formattedNet} ${currencySymbol} + KDV`;

      quotes.set(product.id, {
        productId: product.id,
        sku: product.sku,
        quantity,
        sourceCurrency: baseCurrency,
        displayCurrency: displayCur,
        fxRate: fxInfo.rate,
        fxFetchedAt: fxInfo.fetchedAt,
        listUnitNetExVat: basePriceInTarget,
        unitNetExVat: finalUnitPriceNet,
        lineNetExVat,
        vatRate: vatRateNum,
        vatAmount,
        lineGross,
        appliedRuleIds,
        appliedRuleNames,
        vatExcludedLabel,
      });
    }

    return quotes;
  },

  /**
   * Tek bir ürün ve müşteri bağlamı için B2B fiyat hesaplama metodu.
   */
  async calculatePrice(
    product: ProductPricingInput,
    customer?: PricingCustomerContext | null,
    quantity: number = 1,
    targetCurrency: string = 'TRY'
  ): Promise<PriceQuote> {
    const quotes = await this.calculateBatch([product], customer, targetCurrency, quantity);
    const quote = quotes.get(product.id);
    return quote || {
      productId: product.id,
      sku: product.sku,
      quantity,
      sourceCurrency: product.currency || 'TRY',
      displayCurrency: targetCurrency,
      fxRate: 1,
      fxFetchedAt: new Date().toISOString(),
      listUnitNetExVat: product.salePrice || 0,
      unitNetExVat: product.salePrice || 0,
      lineNetExVat: (product.salePrice || 0) * quantity,
      vatRate: product.vatRate || 20,
      vatAmount: ((product.salePrice || 0) * quantity * (product.vatRate || 20)) / 100,
      lineGross: (product.salePrice || 0) * quantity * 1.2,
      appliedRuleIds: [],
      appliedRuleNames: [],
      vatExcludedLabel: `${product.salePrice || 0} ₺ + KDV`,
    };
  }
};
