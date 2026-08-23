export const UserRole = {
  B2C_CUSTOMER: 'B2C_CUSTOMER',
  B2B_CUSTOMER: 'B2B_CUSTOMER',
  DEALER: 'DEALER',
  WHOLESALER: 'WHOLESALER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const CompanyStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type CompanyStatus = (typeof CompanyStatus)[keyof typeof CompanyStatus];

export const CompanyMemberRole = {
  OWNER: 'OWNER',
  BUYER: 'BUYER',
  ACCOUNTANT: 'ACCOUNTANT',
} as const;
export type CompanyMemberRole = (typeof CompanyMemberRole)[keyof typeof CompanyMemberRole];

export const PriceRuleType = {
  CUSTOMER_PRODUCT: 'CUSTOMER_PRODUCT',
  CUSTOMER_CATEGORY: 'CUSTOMER_CATEGORY',
  CUSTOMER_BRAND: 'CUSTOMER_BRAND',
  CUSTOMER_PERCENT: 'CUSTOMER_PERCENT',
  GROUP_PRODUCT: 'GROUP_PRODUCT',
  GROUP_CATEGORY: 'GROUP_CATEGORY',
  GROUP_BRAND: 'GROUP_BRAND',
  GROUP_PERCENT: 'GROUP_PERCENT',
  QTY_TIER: 'QTY_TIER',
  CATEGORY_CAMPAIGN: 'CATEGORY_CAMPAIGN',
  BRAND_CAMPAIGN: 'BRAND_CAMPAIGN',
} as const;
export type PriceRuleType = (typeof PriceRuleType)[keyof typeof PriceRuleType];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentPurpose = {
  ORDER: 'ORDER',
  CURRENT_ACCOUNT: 'CURRENT_ACCOUNT',
} as const;
export type PaymentPurpose = (typeof PaymentPurpose)[keyof typeof PaymentPurpose];

export const LedgerType = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
} as const;
export type LedgerType = (typeof LedgerType)[keyof typeof LedgerType];

export const SupportedCurrency = {
  TRY: 'TRY',
  EUR: 'EUR',
  USD: 'USD',
} as const;
export type SupportedCurrency = (typeof SupportedCurrency)[keyof typeof SupportedCurrency];
