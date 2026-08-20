import { mockCurrencyProvider } from './mock';
import { tcmbCurrencyProvider } from './tcmb';
import type { CurrencyProvider } from './types';

export type { CurrencyProvider, FxQuote } from './types';

export function getCurrencyProvider(): CurrencyProvider {
  const name = process.env.CURRENCY_PROVIDER ?? 'mock';
  if (name === 'tcmb') return tcmbCurrencyProvider;
  return mockCurrencyProvider;
}
