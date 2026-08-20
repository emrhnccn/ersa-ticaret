export interface PaymentInitRequest {
  orderId?: string | null;
  companyId?: string | null;
  userId?: string | null;
  purpose: 'ORDER' | 'CURRENT_ACCOUNT';
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: {
    line1: string;
    city: string;
    district?: string;
    taxNo?: string;
    taxOffice?: string;
  };
  callbackUrl: string;
}

export interface PaymentInitResponse {
  paymentId: string;
  provider: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  redirectUrl?: string;
  htmlContent?: string;
  token?: string;
}

export interface PaymentCallbackResult {
  paymentId: string;
  providerRef: string;
  status: 'PAID' | 'FAILED';
  amount: number;
  currency: string;
  errorMessage?: string;
  rawPayload?: any;
}

export interface PaymentGatewayAdapter {
  providerName: string;
  initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyCallback(payload: any): Promise<PaymentCallbackResult>;
  refund(paymentRef: string, amount: number): Promise<{ success: boolean; refundId?: string }>;
}
