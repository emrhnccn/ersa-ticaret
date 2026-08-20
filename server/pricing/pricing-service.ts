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
    if (!customer || (!customer.companyId && !customer.customerGroupId)) {
      return [];
    }

    const now = new Date();
    return prisma.priceRule.findMany({
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
      orderBy: { priority: 'asc' },
    });
  },

  /**
   * Toplu Ürün Fiyatlandırma Motoru (Zero N+1 Query).
   * 24-100 ürünü tek bir DB sorgusu ile bellek içinde anında hesaplar.
   */
  async calculateBatch(
    products: ProductPricingInput[],
    customer?: PricingCustomerContext | null,
    targetCurrency: string = 'TRY'
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

      // Bellek içi kural eşleştirme
      for (const rule of activeRules) {
        let isMatch = false;

        if (rule.type === 'CUSTOMER_PRODUCT' && rule.companyId === customer?.companyId && rule.productId === product.id) {
          isMatch = true;
        } else if (rule.type === 'GROUP_PRODUCT' && rule.customerGroupId === customer?.customerGroupId && rule.productId === product.id) {
          isMatch = true;
        } else if (rule.type === 'GROUP_BRAND' && rule.customerGroupId === customer?.customerGroupId && rule.brandId && rule.brandId === product.brandId) {
          isMatch = true;
        } else if (rule.type === 'GROUP_CATEGORY' && rule.customerGroupId === customer?.customerGroupId && rule.categoryId && rule.categoryId === product.categoryId) {
          isMatch = true;
        } else if (rule.type === 'GROUP_PERCENT' && rule.customerGroupId === customer?.customerGroupId) {
          isMatch = true;
        } else if (rule.type === 'QTY_TIER' && rule.minQty && 1 >= rule.minQty) {
          if (rule.productId && rule.productId === product.id) isMatch = true;
          else if (rule.customerGroupId && rule.customerGroupId === customer?.customerGroupId) isMatch = true;
        }

        if (isMatch) {
          if (rule.specialPrice !== null && rule.specialPrice !== undefined) {
            const specPriceNum = Number(rule.specialPrice);
            const tryFx = fxRates.get('TRY') || { rate: 1 };
            finalUnitPriceNet = Number((specPriceNum * tryFx.rate).toFixed(2));
          } else if (rule.discountPercent !== null && rule.discountPercent !== undefined) {
            const disc = Number(rule.discountPercent);
            finalUnitPriceNet = Number((basePriceInTarget * (1 - disc / 100)).toFixed(2));
          }

          appliedRuleIds.push(rule.id);
          appliedRuleNames.push(rule.name);
          break;
        }
      }

      const lineNetExVat = Number(finalUnitPriceNet.toFixed(2));
      const vatAmount = Number((lineNetExVat * (vatRateNum / 100)).toFixed(2));
      const lineGross = Number((lineNetExVat + vatAmount).toFixed(2));

      const currencySymbol = displayCur === 'EUR' ? '€' : displayCur === 'USD' ? '$' : '₺';
      const formattedNet = finalUnitPriceNet.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const vatExcludedLabel = `${formattedNet} ${currencySymbol} + KDV`;

      quotes.set(product.id, {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
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
    const quotes = await this.calculateBatch([product], customer, targetCurrency);
    const quote = quotes.get(product.id);
    if (quote && quantity > 1) {
      quote.quantity = quantity;
      quote.lineNetExVat = Number((quote.unitNetExVat * quantity).toFixed(2));
      quote.vatAmount = Number((quote.lineNetExVat * (quote.vatRate / 100)).toFixed(2));
      quote.lineGross = Number((quote.lineNetExVat + quote.vatAmount).toFixed(2));
    }
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
