import { prisma } from '../db';
import { pricingService } from '../pricing/pricing-service';
import { products as fallbackRawProducts } from '@/lib/data';
import type { PricingCustomerContext } from '@/shared/types/pricing';
import * as React from 'react';

const serverCache = typeof React.cache === 'function' ? React.cache : <T extends (...args: any[]) => any>(fn: T): T => fn;

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
  /**
   * Optimize edilmiş, `select` kullanan ve Zero N+1 Batch Fiyatlandırma motoruna sahip ürün listeleme fonksiyonu.
   */
  async getProducts(params: ProductFilterParams, customer?: PricingCustomerContext | null) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 24));
    const skip = (page - 1) * limit;
    const targetCurrency = params.currency || 'TRY';

    try {
      const where: any = {
        status: 'ACTIVE',
      };

      if (params.search) {
        const q = params.search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { barcode: { contains: q, mode: 'insensitive' } },
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

      // Yalnızca gerekli alanları çek (Ağ & Bellek Optimizasyonu)
      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            slug: true,
            name: true,
            sku: true,
            barcode: true,
            salePrice: true,
            currency: true,
            vatRate: true,
            brandId: true,
            categoryId: true,
            stockQty: true,
            minOrderQty: true,
            unit: true,
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
              select: { url: true }
            }
          }
        })
      ]);

      if (products.length > 0) {
        // TOPLU FİYATLANDIRMA (0 N+1 QUERY)
        const pricingInputs = products.map(p => ({
          id: p.id,
          sku: p.sku,
          salePrice: p.salePrice ? Number(p.salePrice) : null,
          currency: p.currency,
          vatRate: Number(p.vatRate),
          brandId: p.brandId,
          categoryId: p.categoryId,
        }));

        const quotesMap = await pricingService.calculateBatch(pricingInputs, customer, targetCurrency);

        const pricedItems = products.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          categoryName: p.category?.name || 'Genel',
          categorySlug: p.category?.slug || '',
          brandName: p.brand?.name || 'Genel',
          brandSlug: p.brand?.slug || '',
          imageUrl: p.images[0]?.url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Gorsel+Yok',
          inStock: Number(p.stockQty) > 0,
          stockQty: Number(p.stockQty),
          minOrderQty: Number(p.minOrderQty || 1),
          unit: p.unit,
          priceQuote: quotesMap.get(p.id)!,
        }));

        return {
          items: pricedItems,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          }
        };
      }
    } catch (dbError) {
      console.warn('DB product query failed, using fallback catalog:', dbError);
    }

    // Fallback katalog
    const filtered = fallbackRawProducts.filter(p => {
      if (params.search && !p.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      if (params.categorySlug && params.categorySlug !== 'Tümü' && p.category !== params.categorySlug) return false;
      return true;
    });

    const paginated = filtered.slice(skip, skip + limit).map((p, idx) => ({
      id: `fallback-${idx}`,
      slug: p.slug,
      name: p.title,
      sku: p.code || `OEM-${idx}`,
      barcode: null,
      categoryName: p.category,
      categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
      brandName: p.brand || 'Genel',
      brandSlug: (p.brand || 'genel').toLowerCase(),
      imageUrl: p.image,
      inStock: true,
      stockQty: 25,
      minOrderQty: 1,
      unit: 'ADET',
      priceQuote: {
        productId: `fallback-${idx}`,
        sku: p.code,
        quantity: 1,
        sourceCurrency: 'TRY',
        displayCurrency: targetCurrency,
        fxRate: 1,
        fxFetchedAt: new Date().toISOString(),
        listUnitNetExVat: 1250,
        unitNetExVat: 1250,
        lineNetExVat: 1250,
        vatRate: 20,
        vatAmount: 250,
        lineGross: 1500,
        appliedRuleIds: [],
        appliedRuleNames: [],
        vatExcludedLabel: `1.250,00 ${targetCurrency === 'EUR' ? '€' : targetCurrency === 'USD' ? '$' : '₺'} + KDV`,
      }
    }));

    return {
      items: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      }
    };
  },

  /**
   * Tek ürün detayını çeker (React cache ile istek bazlı tekilleştirilmiş).
   */
  getProductBySlug: serverCache(async (slug: string, customer?: PricingCustomerContext | null, currency: string = 'TRY') => {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, alt: true, sortOrder: true } },
          documents: { select: { id: true, title: true, url: true } },
          variants: { select: { id: true, sku: true, name: true, stockQty: true, salePrice: true } },
        }
      });

      if (product) {
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
          minOrderQty: Number(product.minOrderQty || 1),
          unit: product.unit,
          specs,
          priceQuote: quote,
          relatedProducts: [],
        };
      }
    } catch (e) {
      console.warn('DB getProductBySlug failed:', e);
    }

    const fallback = fallbackRawProducts.find(p => p.slug === slug);
    if (!fallback) return null;

    return {
      id: fallback.slug,
      slug: fallback.slug,
      name: fallback.title,
      sku: fallback.code,
      barcode: null,
      description: fallback.description,
      category: { id: 'cat-1', name: fallback.category, slug: fallback.category.toLowerCase().replace(/\s+/g, '-') },
      brand: { id: 'br-1', name: fallback.brand || 'Genel', slug: (fallback.brand || 'genel').toLowerCase() },
      images: [{ id: 'img-1', url: fallback.image, alt: fallback.title, sortOrder: 0 }],
      documents: [],
      variants: [],
      inStock: true,
      stockQty: 25,
      minOrderQty: 1,
      unit: 'ADET',
      specs: { 'Kategori': fallback.category, 'Marka': fallback.brand },
      priceQuote: {
        productId: fallback.slug,
        sku: fallback.code,
        quantity: 1,
        sourceCurrency: 'TRY',
        displayCurrency: currency,
        fxRate: 1,
        fxFetchedAt: new Date().toISOString(),
        listUnitNetExVat: 1250,
        unitNetExVat: 1250,
        lineNetExVat: 1250,
        vatRate: 20,
        vatAmount: 250,
        lineGross: 1500,
        appliedRuleIds: [],
        appliedRuleNames: [],
        vatExcludedLabel: `1.250,00 ₺ + KDV`,
      },
      relatedProducts: [],
    };
  }),

  /**
   * Kategorileri çeker (React cache ile istek bazlı tekilleştirilmiş).
   */
  getCategories: serverCache(async () => {
    try {
      const cats = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } }
        }
      });
      if (cats.length > 0) return cats;
    } catch {}

    const uniqueNames = Array.from(new Set(fallbackRawProducts.map(p => p.category))).filter(Boolean);
    return uniqueNames.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      _count: { products: 12 }
    }));
  }),

  /**
   * Markaları çeker (React cache ile istek bazlı tekilleştirilmiş).
   */
  getBrands: serverCache(async () => {
    try {
      const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } }
        }
      });
      if (brands.length > 0) return brands;
    } catch {}

    const uniqueBrands = Array.from(new Set(fallbackRawProducts.map(p => p.brand))).filter(Boolean);
    return uniqueBrands.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      _count: { products: 5 }
    }));
  })
};
