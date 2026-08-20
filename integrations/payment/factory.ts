import type { PaymentGatewayAdapter } from './types';
import { mockPosAdapter } from './mock-pos/adapter';

export function getPaymentGateway(provider?: string): PaymentGatewayAdapter {
  const p = (provider || process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
  // Gelecekte iyzico/paytr adapter'ları buraya bağlanır
  return mockPosAdapter;
}
