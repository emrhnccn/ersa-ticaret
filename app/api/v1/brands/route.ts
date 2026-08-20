import { NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';

export async function GET() {
  try {
    const brands = await productService.getBrands();
    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
