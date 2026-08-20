import type { CurrencyProvider, FxQuote } from './types';

/**
 * TCMB günlük kur XML'i (ücretsiz, resmi).
 * https://www.tcmb.gov.tr/kurlar/today.xml
 * Kod uydurulmuş endpoint değil; TCMB'nin yayınladığı adres.
 */
const TCMB_TODAY = 'https://www.tcmb.gov.tr/kurlar/today.xml';

function xmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
  return match?.[1] ?? null;
}

export const tcmbCurrencyProvider: CurrencyProvider = {
  name: 'tcmb',
  async fetchRate(base: string, quote: string): Promise<FxQuote> {
    const b = base.toUpperCase();
    const q = quote.toUpperCase();
    if (b === q) {
      return { base: b, quote: q, rate: 1, source: 'tcmb', fetchedAt: new Date() };
    }
    if (q !== 'TRY' && b !== 'TRY') {
      throw new Error('TCMB adapter şu an yalnızca TRY çaprazını destekler');
    }

    const res = await fetch(TCMB_TODAY, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`TCMB yanıtı ${res.status}`);
    }
    const xml = await res.text();

    const foreign = b === 'TRY' ? q : b;
    const blockMatch = xml.match(
      new RegExp(`<Currency[^>]*Kod="${foreign}"[\\s\\S]*?</Currency>`)
    );
    if (!blockMatch) {
      throw new Error(`TCMB'de ${foreign} kuru yok`);
    }
    const forexSelling = xmlTag(blockMatch[0], 'ForexSelling');
    const unit = Number(xmlTag(blockMatch[0], 'Unit') ?? '1');
    if (!forexSelling) {
      throw new Error(`TCMB ${foreign} satış kuru okunamadı`);
    }
    const tryPerForeign = Number(forexSelling.replace(',', '.')) / (unit || 1);
    const rate = b === 'TRY' ? 1 / tryPerForeign : tryPerForeign;

    return {
      base: b,
      quote: q,
      rate,
      source: 'tcmb',
      fetchedAt: new Date(),
    };
  },
};
