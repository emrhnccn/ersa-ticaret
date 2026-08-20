import type { CurrencyProvider, FxQuote } from './types';

/** Geliştirme kurları. Üretimde TCMB adapter'ı seçilir. */
const MOCK_RATES: Record<string, number> = {
  'EUR/TRY': 36.5,
  'USD/TRY': 33.8,
  'TRY/TRY': 1,
  'EUR/EUR': 1,
  'USD/USD': 1,
};

export const mockCurrencyProvider: CurrencyProvider = {
  name: 'mock',
  async fetchRate(base: string, quote: string): Promise<FxQuote> {
    const key = `${base.toUpperCase()}/${quote.toUpperCase()}`;
    const inverse = `${quote.toUpperCase()}/${base.toUpperCase()}`;
    let rate = MOCK_RATES[key];
    if (rate == null && MOCK_RATES[inverse]) {
      rate = 1 / MOCK_RATES[inverse];
    }
    if (rate == null) {
      throw new Error(`Mock kur bulunamadı: ${key}`);
    }
    return {
      base: base.toUpperCase(),
      quote: quote.toUpperCase(),
      rate,
      source: 'mock',
      fetchedAt: new Date(),
    };
  },
};
