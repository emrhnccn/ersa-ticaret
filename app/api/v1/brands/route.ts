import { NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';

export const revalidate = 3600; // 1 saat ISR önbellek

export async function GET() {
  try {
    const brands = await productService.getBrands();
    return NextResponse.json(
      { brands },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
