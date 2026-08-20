import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const brandSlug = searchParams.get('brand') || undefined;
    const inStockOnly = searchParams.get('inStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const currency = searchParams.get('currency') || 'TRY';

    const session = getSessionUser(req);
    const customerContext = session ? {
      userId: session.userId,
      companyId: session.companyId || undefined,
      customerGroupId: session.customerGroupId || undefined,
    } : null;

    const result = await productService.getProducts(
      { search, categorySlug, brandSlug, inStockOnly, page, limit, sortBy, currency },
      customerContext
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ürünler yüklenemedi' }, { status: 500 });
  }
}
