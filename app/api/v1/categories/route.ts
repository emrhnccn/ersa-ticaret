import { NextResponse } from 'next/server';
import { productService } from '@/server/catalog/product-service';

export async function GET() {
  try {
    const categories = await productService.getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
