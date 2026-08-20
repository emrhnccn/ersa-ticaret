import { NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await productService.getCategories();
    return NextResponse.json(
      { categories },
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
