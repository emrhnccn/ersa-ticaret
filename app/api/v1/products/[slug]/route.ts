import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';
import { getSessionUser } from '@/server/auth/jwt';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency') || 'TRY';

    const session = getSessionUser(req);
    const customerContext = session ? {
      userId: session.userId,
      companyId: session.companyId || undefined,
      customerGroupId: session.customerGroupId || undefined,
    } : null;

    const product = await productService.getProductBySlug(params.slug, customerContext, currency);

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ürün yüklenemedi' }, { status: 500 });
  }
}
