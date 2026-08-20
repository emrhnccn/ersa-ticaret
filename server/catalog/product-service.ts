import { prisma } from '../db';
import { pricingService } from '../pricing/pricing-service';
import type { PricingCustomerContext } from '@/shared/types/pricing';

export interface ProductFilterParams {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  currency?: string;
}

export const productService = {
  async getProducts(params: ProductFilterParams, customer?: PricingCustomerContext | null) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 24));
    const skip = (page - 1) * limit;
    const targetCurrency = params.currency || 'TRY';

    const where: any = {
      status: 'ACTIVE',
    };

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { barcode: { contains: q } },
      ];
    }

    if (params.categorySlug && params.categorySlug !== 'Tümü' && params.categorySlug !== 'all') {
      where.category = { slug: params.categorySlug };
    }

    if (params.brandSlug && params.brandSlug !== 'Tümü' && params.brandSlug !== 'all') {
      where.brand = { slug: params.brandSlug };
    }

    if (params.inStockOnly) {
      where.stockQty = { gt: 0 };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sortBy === 'price_asc') orderBy = { salePrice: 'asc' };
    if (params.sortBy === 'price_desc') orderBy = { salePrice: 'desc' };
    if (params.sortBy === 'name_asc') orderBy = { name: 'asc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        }
      })
    ]);

    // Fiyatlandırma motorunu çalıştır
    const pricedItems = await Promise.all(
      products.map(async (p) => {
        const quote = await pricingService.calculatePrice(
          {
            id: p.id,
            sku: p.sku,
            salePrice: p.salePrice ? Number(p.salePrice) : null,
            currency: p.currency,
            vatRate: Number(p.vatRate),
            brandId: p.brandId,
            categoryId: p.categoryId,
          },
          customer,
          1,
          targetCurrency
        );

        let specs: Record<string, string> = {};
        try {
          if (p.specsJson) specs = JSON.parse(p.specsJson);
        } catch {}

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          description: p.description,
          categoryName: p.category?.name || 'Genel',
          categorySlug: p.category?.slug || '',
          brandName: p.brand?.name || 'Genel',
          brandSlug: p.brand?.slug || '',
          imageUrl: p.images[0]?.url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok',
          inStock: Number(p.stockQty) > 0,
          stockQty: Number(p.stockQty),
          minOrderQty: Number(p.minOrderQty),
          unit: p.unit,
          specs,
          priceQuote: quote,
        };
      })
    );

    return {
      items: pricedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  },

  async getProductBySlug(slug: string, customer?: PricingCustomerContext | null, currency: string = 'TRY') {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        variants: true,
      }
    });

    if (!product) return null;

    const quote = await pricingService.calculatePrice(
      {
        id: product.id,
        sku: product.sku,
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        currency: product.currency,
        vatRate: Number(product.vatRate),
        brandId: product.brandId,
        categoryId: product.categoryId,
      },
      customer,
      1,
      currency
    );

    // İlgili ürünler (aynı kategori)
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      take: 4,
      include: {
        category: true,
        brand: true,
        images: { take: 1 },
      }
    });

    const pricedRelated = await Promise.all(
      related.map(async (r) => {
        const rQuote = await pricingService.calculatePrice(
          {
            id: r.id,
            sku: r.sku,
            salePrice: r.salePrice ? Number(r.salePrice) : null,
            currency: r.currency,
            vatRate: Number(r.vatRate),
            brandId: r.brandId,
            categoryId: r.categoryId,
          },
          customer,
          1,
          currency
        );
        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          sku: r.sku,
          categoryName: r.category?.name || '',
          brandName: r.brand?.name || '',
          imageUrl: r.images[0]?.url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok',
          inStock: Number(r.stockQty) > 0,
          priceQuote: rQuote,
        };
      })
    );

    let specs: Record<string, string> = {};
    try {
      if (product.specsJson) specs = JSON.parse(product.specsJson);
    } catch {}

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      description: product.description,
      category: product.category,
      brand: product.brand,
      images: product.images,
      documents: product.documents,
      variants: product.variants,
      inStock: Number(product.stockQty) > 0,
      stockQty: Number(product.stockQty),
      minOrderQty: Number(product.minOrderQty),
      unit: product.unit,
      specs,
      priceQuote: quote,
      relatedProducts: pricedRelated,
    };
  },

  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      }
    });
  },

  async getBrands() {
    return prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      }
    });
  }
};
