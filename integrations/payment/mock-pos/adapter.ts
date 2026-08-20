import type { PaymentGatewayAdapter, PaymentInitRequest, PaymentInitResponse, PaymentCallbackResult } from '../types';

export class MockPosPaymentAdapter implements PaymentGatewayAdapter {
  providerName = 'MOCK_POS';

  async initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    const mockPaymentToken = `MOCK_TX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      paymentId: mockPaymentToken,
      provider: this.providerName,
      status: 'PENDING',
      redirectUrl: `/odeme/simulasyon?token=${mockPaymentToken}&amount=${request.amount}&currency=${request.currency}&purpose=${request.purpose}`,
      token: mockPaymentToken,
    };
  }

  async verifyCallback(payload: any): Promise<PaymentCallbackResult> {
    const isSuccess = payload.status !== 'FAILED';
    return {
      paymentId: payload.paymentId || `PAY_${Date.now()}`,
      providerRef: payload.token || `MOCK_REF_${Date.now()}`,
      status: isSuccess ? 'PAID' : 'FAILED',
      amount: Number(payload.amount || 0),
      currency: payload.currency || 'TRY',
      rawPayload: payload,
    };
  }

  async refund(paymentRef: string, amount: number) {
    return {
      success: true,
      refundId: `REF_${paymentRef}_${Date.now()}`,
    };
  }
}

export const mockPosAdapter = new MockPosPaymentAdapter();
