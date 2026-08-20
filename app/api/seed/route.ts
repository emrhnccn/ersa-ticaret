import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    const [productCount, userCount, companyCount, ruleCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.company.count(),
      prisma.priceRule.count(),
    ]);

    return NextResponse.json({
      durum: 'BAŞARILI',
      veritabani: 'Prisma SQLite (B2B + B2C Mimari)',
      istatistikler: {
        toplamUrun: productCount,
        toplamKullanici: userCount,
        toplamSirket: companyCount,
        fiyatKurallari: ruleCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ durum: 'HATA', mesaj: error.message }, { status: 500 });
  }
}