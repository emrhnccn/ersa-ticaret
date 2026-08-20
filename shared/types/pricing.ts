import type { PriceRuleType } from './enums';

export type PricingCustomerContext = {
  userId?: string;
  companyId?: string;
  customerGroupId?: string;
};

export type PricedProductInput = {
  id: string;
  sku: string;
  salePrice: number | null;
  vatRate: number;
  currency: string;
  brandId?: string | null;
  categoryId?: string | null;
  categoryPathIds?: string[];
};

export type PriceRuleMatch = {
  id: string;
  name: string;
  type: PriceRuleType;
  priority: number;
  discountPercent: number | null;
  specialPrice: number | null;
  minQty: number | null;
};

export type PriceQuote = {
  productId: string;
  sku: string;
  quantity: number;
  sourceCurrency: string;
  displayCurrency: string;
  fxRate: number;
  fxFetchedAt: string | null;
  listUnitNetExVat: number;
  unitNetExVat: number;
  lineNetExVat: number;
  vatRate: number;
  vatAmount: number;
  lineGross: number;
  appliedRuleIds: string[];
  appliedRuleNames: string[];
  vatExcludedLabel: string;
};
