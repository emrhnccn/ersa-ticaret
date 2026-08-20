import { NextResponse } from 'next/server';
import { currencyService } from '@/server/currency/currency-service';

export async function GET() {
  try {
    const [eur, usd] = await Promise.all([
      currencyService.getExchangeRate('EUR', 'TRY'),
      currencyService.getExchangeRate('USD', 'TRY'),
    ]);

    return NextResponse.json({
      rates: {
        EUR_TRY: eur.rate,
        USD_TRY: usd.rate,
        TRY_TRY: 1,
      },
      sources: {
        EUR: eur.source,
        USD: usd.source,
      },
      fetchedAt: eur.fetchedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
