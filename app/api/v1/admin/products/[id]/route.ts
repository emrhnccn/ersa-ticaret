import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSessionUser } from '@/server/auth/jwt';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

// GET /api/v1/admin/products/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams?.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: { orderBy: { sortOrder: 'asc' } },
        supplierProducts: true,
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('[Admin Product Detail Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/v1/admin/products/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams?.id;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Düzenlenecek ürün bulunamadı.' }, { status: 404 });
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.sku !== undefined) updateData.sku = body.sku.trim();
    if (body.barcode !== undefined) updateData.barcode = body.barcode?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.currency !== undefined) updateData.currency = body.currency.toUpperCase();

    if (body.vatRate !== undefined) updateData.vatRate = new Decimal(body.vatRate);
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice !== null && body.costPrice !== '' ? new Decimal(body.costPrice) : null;
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice !== null && body.salePrice !== '' ? new Decimal(body.salePrice) : null;
    if (body.stockQty !== undefined) updateData.stockQty = new Decimal(body.stockQty);
    if (body.minOrderQty !== undefined) updateData.minOrderQty = new Decimal(body.minOrderQty);

    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.brandId !== undefined) updateData.brandId = body.brandId || null;
    if (body.supplierId !== undefined) updateData.supplierId = body.supplierId || null;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: { orderBy: { sortOrder: 'asc' } },
      }
    });

    // Handle new image if provided
    if (body.imageUrl && typeof body.imageUrl === 'string') {
      const trimmedUrl = body.imageUrl.trim();
      if (trimmedUrl) {
        const existingImg = await prisma.productImage.findFirst({
          where: { productId, url: trimmedUrl }
        });
        if (!existingImg) {
          await prisma.productImage.create({
            data: {
              productId,
              url: trimmedUrl,
              originalUrl: trimmedUrl,
              sortOrder: 0,
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün bilgileri başarıyla güncellendi.',
      product: updated,
    });
  } catch (error: any) {
    console.error('[Admin Product Update Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/admin/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams?.id;

    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.supplierProduct.deleteMany({ where: { productId } });
    await prisma.productVariant.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla silindi.',
    });
  } catch (error: any) {
    console.error('[Admin Product Delete Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
