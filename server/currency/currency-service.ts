import { prisma } from '../db';
import { getCurrencyProvider } from '@/integrations/currency';

interface CachedRate {
  rate: number;
  fetchedAt: Date;
}

const memoryRates = new Map<string, CachedRate>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

export const currencyService = {
  async getExchangeRate(base: string, quote: string = 'TRY'): Promise<{ rate: number; source: string; fetchedAt: Date }> {
    const b = base.toUpperCase();
    const q = quote.toUpperCase();

    if (b === q) {
      return { rate: 1, source: 'fixed', fetchedAt: new Date() };
    }

    const key = `${b}_${q}`;
    const cached = memoryRates.get(key);
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
      return { rate: cached.rate, source: 'cache', fetchedAt: cached.fetchedAt };
    }

    // 1. Önce Veritabanını kontrol et
    const dbRate = await prisma.exchangeRate.findFirst({
      where: { base: b, quote: q },
      orderBy: { fetchedAt: 'desc' },
    });

    if (dbRate && Date.now() - dbRate.fetchedAt.getTime() < CACHE_TTL_MS) {
      const rateNum = Number(dbRate.rate);
      memoryRates.set(key, { rate: rateNum, fetchedAt: dbRate.fetchedAt });
      return { rate: rateNum, source: dbRate.source, fetchedAt: dbRate.fetchedAt };
    }

    // 2. Sağlayıcıdan (TCMB / Mock) taze kur çek
    try {
      const provider = getCurrencyProvider();
      const fx = await provider.fetchRate(b, q);
      
      memoryRates.set(key, { rate: fx.rate, fetchedAt: fx.fetchedAt });

      await prisma.exchangeRate.upsert({
        where: {
          base_quote_source: {
            base: b,
            quote: q,
            source: fx.source,
          }
        },
        update: {
          rate: fx.rate,
          fetchedAt: fx.fetchedAt,
        },
        create: {
          base: b,
          quote: q,
          rate: fx.rate,
          source: fx.source,
          fetchedAt: fx.fetchedAt,
        }
      });

      return { rate: fx.rate, source: fx.source, fetchedAt: fx.fetchedAt };
    } catch (error) {
      console.error(`Kur çekme hatası (${b}/${q}):`, error);
      // DB'deki son geçerli kuru kullan veya fallback dön
      if (dbRate) {
        return { rate: Number(dbRate.rate), source: 'fallback_db', fetchedAt: dbRate.fetchedAt };
      }
      // Sabit fallback'ler
      const fallbackRates: Record<string, number> = {
        'EUR_TRY': 38.50,
        'USD_TRY': 36.20,
      };
      const fallbackRate = fallbackRates[key] || 1;
      return { rate: fallbackRate, source: 'static_fallback', fetchedAt: new Date() };
    }
  },

  async convert(amount: number, fromCurrency: string, toCurrency: string = 'TRY'): Promise<{ convertedAmount: number; fxRate: number; fetchedAt: Date }> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return { convertedAmount: amount, fxRate: 1, fetchedAt: new Date() };
    }

    const { rate, fetchedAt } = await this.getExchangeRate(from, to);
    const convertedAmount = Number((amount * rate).toFixed(2));

    return { convertedAmount, fxRate: rate, fetchedAt };
  }
};
