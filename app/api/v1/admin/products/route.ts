import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSessionUser } from '@/server/auth/jwt';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
  };
  return text
    .split('')
    .map(c => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET /api/v1/admin/products
export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const categoryId = searchParams.get('categoryId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    const stockStatus = searchParams.get('stockStatus'); // 'in_stock', 'out_of_stock'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;
    if (brandId && brandId !== 'ALL') where.brandId = brandId;
    if (supplierId && supplierId !== 'ALL') where.supplierId = supplierId;

    if (stockStatus === 'in_stock') {
      where.stockQty = { gt: 0 };
    } else if (stockStatus === 'out_of_stock') {
      where.stockQty = { lte: 0 };
    }

    const [total, products, categories, brands, suppliers] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          supplier: { select: { id: true, name: true, code: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
        },
      }),
      prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
      prisma.brand.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
      prisma.supplier.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: 'asc' } }),
    ]);

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      slug: p.slug,
      description: p.description,
      status: p.status,
      unit: p.unit || 'ADET',
      vatRate: p.vatRate ? Number(p.vatRate) : 20,
      currency: p.currency || 'TRY',
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      stockQty: Number(p.stockQty || 0),
      minOrderQty: Number(p.minOrderQty || 1),
      category: p.category,
      categoryId: p.categoryId,
      brand: p.brand,
      brandId: p.brandId,
      supplier: p.supplier,
      supplierId: p.supplierId,
      imageUrl: p.images[0]?.url || '/placeholder-spare.png',
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products: formatted,
      categories,
      brands,
      suppliers,
    });
  } catch (error: any) {
    console.error('[Admin Products List Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/v1/admin/products (Yeni Ürün Ekleme)
export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      barcode,
      description,
      unit = 'ADET',
      vatRate = 20,
      currency = 'TRY',
      costPrice,
      salePrice,
      stockQty = 0,
      minOrderQty = 1,
      status = 'ACTIVE',
      categoryId,
      brandId,
      supplierId,
      imageUrl,
    } = body;

    if (!name || !sku) {
      return NextResponse.json({ success: false, error: 'Ürün adı ve stok kodu (SKU) zorunludur.' }, { status: 400 });
    }

    const baseSlug = slugify(name) || sku.toLowerCase();
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku: sku.trim(),
        slug,
        barcode: barcode?.trim() || null,
        description: description?.trim() || null,
        unit,
        vatRate: new Decimal(vatRate),
        currency: currency.toUpperCase(),
        costPrice: costPrice ? new Decimal(costPrice) : null,
        salePrice: salePrice ? new Decimal(salePrice) : null,
        stockQty: new Decimal(stockQty),
        minOrderQty: new Decimal(minOrderQty),
        status,
        categoryId: categoryId || null,
        brandId: brandId || null,
        supplierId: supplierId || null,
        ...(imageUrl ? {
          images: {
            create: [{ url: imageUrl, originalUrl: imageUrl, sortOrder: 0 }]
          }
        } : {})
      },
      include: {
        category: true,
        brand: true,
        images: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu.',
      product: newProduct,
    });
  } catch (error: any) {
    console.error('[Admin Product Create Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
