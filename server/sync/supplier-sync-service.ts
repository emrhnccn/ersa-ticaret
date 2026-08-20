import { prisma } from '@/server/db';
import { supplierFactory } from '@/integrations/suppliers/factory';
import type { RawSupplierProduct, SyncOptions, SyncResult, ImportMode } from '@/integrations/suppliers/types';
import { Prisma } from '@prisma/client';

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

export interface SyncContext {
  categoryMap: Map<string, string>; // lowerName / slug -> id
  brandMap: Map<string, string>; // lowerName / slug -> id
  supplierMappingMap: Map<string, string>; // supplierCategoryName -> targetCategoryId
  supplierProductMap: Map<string, { id: string; productId: string | null }>; // externalSku -> info
  productSkuMap: Map<string, string>; // sku / barcode -> productId
}

export class SupplierSyncService {
  /**
   * Tedarikçinin DB'deki kaydını garanti eder (yoksa açar).
   */
  async ensureSupplier(code: string, name: string): Promise<string> {
    const existing = await prisma.supplier.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) return existing.id;

    const created = await prisma.supplier.create({
      data: {
        code: code.toUpperCase(),
        name,
        active: true,
      },
    });

    return created.id;
  }

  /**
   * Hızlı in-memory önbellek yükleyici. Tek seferde tüm kategori, marka ve mevcut ürün haritalarını çeker.
   */
  private async loadSyncContext(supplierId: string): Promise<SyncContext> {
    const [categories, brands, mappings, supplierProds, prods] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.brand.findMany({ select: { id: true, name: true, slug: true } }),
      prisma.supplierCategoryMapping.findMany({
        where: { supplierId },
        select: { supplierCategoryName: true, targetCategoryId: true }
      }),
      prisma.supplierProduct.findMany({
        where: { supplierId },
        select: { id: true, externalSku: true, productId: true }
      }),
      prisma.product.findMany({
        select: { id: true, sku: true, barcode: true }
      })
    ]);

    const categoryMap = new Map<string, string>();
    for (const c of categories) {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
      categoryMap.set(c.slug.toLowerCase().trim(), c.id);
    }

    const brandMap = new Map<string, string>();
    for (const b of brands) {
      brandMap.set(b.name.toLowerCase().trim(), b.id);
      brandMap.set(b.slug.toLowerCase().trim(), b.id);
    }

    const supplierMappingMap = new Map<string, string>();
    for (const m of mappings) {
      if (m.targetCategoryId) {
        supplierMappingMap.set(m.supplierCategoryName.trim(), m.targetCategoryId);
      }
    }

    const supplierProductMap = new Map<string, { id: string; productId: string | null }>();
    for (const sp of supplierProds) {
      supplierProductMap.set(sp.externalSku.trim(), { id: sp.id, productId: sp.productId });
    }

    const productSkuMap = new Map<string, string>();
    for (const p of prods) {
      if (p.sku) productSkuMap.set(p.sku.trim(), p.id);
      if (p.barcode) productSkuMap.set(p.barcode.trim(), p.id);
    }

    return {
      categoryMap,
      brandMap,
      supplierMappingMap,
      supplierProductMap,
      productSkuMap,
    };
  }

  /**
   * Kategori eşleştirmesi veya otomatik oluşturma (Hızlı önbellekli).
   */
  private async resolveCategory(
    supplierId: string,
    rawCategoryName?: string | null,
    ctx?: SyncContext
  ): Promise<string | null> {
    if (!rawCategoryName) return null;
    const trimmed = rawCategoryName.trim();
    if (!trimmed) return null;

    // 1. Check supplier mapping map
    if (ctx?.supplierMappingMap.has(trimmed)) {
      return ctx.supplierMappingMap.get(trimmed)!;
    }

    // 2. Check category name / slug map
    const lower = trimmed.toLowerCase();
    const slug = slugify(trimmed) || 'kategori';
    if (ctx?.categoryMap.has(lower)) return ctx.categoryMap.get(lower)!;
    if (ctx?.categoryMap.has(slug)) return ctx.categoryMap.get(slug)!;

    // 3. Fallback or Create in DB
    let cat = await prisma.category.findFirst({
      where: { OR: [{ name: trimmed }, { slug }] }
    });

    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: trimmed,
          slug: `${slug}-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
          vatRate: 20,
        }
      });
    }

    if (ctx) {
      ctx.categoryMap.set(lower, cat.id);
      ctx.categoryMap.set(slug, cat.id);
      ctx.supplierMappingMap.set(trimmed, cat.id);
    }

    // Save mapping in background
    prisma.supplierCategoryMapping.upsert({
      where: {
        supplierId_supplierCategoryName: {
          supplierId,
          supplierCategoryName: trimmed,
        }
      },
      update: { targetCategoryId: cat.id },
      create: {
        supplierId,
        supplierCategoryName: trimmed,
        targetCategoryId: cat.id,
        autoApprove: true,
      }
    }).catch(() => {});

    return cat.id;
  }

  /**
   * Marka eşleştirmesi veya otomatik oluşturma (Hızlı önbellekli).
   */
  private async resolveBrand(rawBrandName?: string | null, ctx?: SyncContext): Promise<string | null> {
    if (!rawBrandName) return null;
    const trimmed = rawBrandName.trim();
    if (!trimmed || trimmed.toLowerCase() === 'genel' || trimmed.toLowerCase() === 'universal') {
      return null;
    }

    const lower = trimmed.toLowerCase();
    const slug = slugify(trimmed) || 'marka';

    if (ctx?.brandMap.has(lower)) return ctx.brandMap.get(lower)!;
    if (ctx?.brandMap.has(slug)) return ctx.brandMap.get(slug)!;

    let brand = await prisma.brand.findFirst({
      where: { OR: [{ name: trimmed }, { slug }] }
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: trimmed,
          slug: `${slug}-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
        }
      });
    }

    if (ctx) {
      ctx.brandMap.set(lower, brand.id);
      ctx.brandMap.set(slug, brand.id);
    }

    return brand.id;
  }

  /**
   * Tekil ürünü içeri aktarır / günceller (Deduplication & UPSERT).
   */
  async upsertProduct(
    supplierId: string,
    supplierCode: string,
    raw: RawSupplierProduct,
    mode: ImportMode = 'FULL',
    ctx?: SyncContext
  ): Promise<{ action: 'CREATED' | 'UPDATED' | 'SKIPPED'; productId?: string }> {
    const externalSku = raw.externalSku.trim();
    if (!externalSku) {
      throw new Error('Ürünün tedarikçi stok kodu (SKU) boş olamaz.');
    }

    // 1. Kategori ve Marka
    const categoryId = await this.resolveCategory(supplierId, raw.subcategory || raw.category, ctx);
    const brandId = await this.resolveBrand(raw.brand, ctx);

    // 2. Mevcut Kaydı Tespit Et
    let productId: string | null = null;
    let existingSupplierProductId: string | null = null;

    if (ctx?.supplierProductMap.has(externalSku)) {
      const cached = ctx.supplierProductMap.get(externalSku)!;
      productId = cached.productId;
      existingSupplierProductId = cached.id;
    } else {
      const existingSP = await prisma.supplierProduct.findUnique({
        where: { supplierId_externalSku: { supplierId, externalSku } }
      });
      if (existingSP) {
        productId = existingSP.productId;
        existingSupplierProductId = existingSP.id;
      }
    }

    // Eğer bağlı Product yoksa, Ersa SKU / Barkod haritasında ara
    if (!productId) {
      const generatedSku = `${supplierCode}-${externalSku}`;
      if (ctx?.productSkuMap.has(externalSku)) productId = ctx.productSkuMap.get(externalSku)!;
      else if (ctx?.productSkuMap.has(generatedSku)) productId = ctx.productSkuMap.get(generatedSku)!;
      else if (raw.barcode && ctx?.productSkuMap.has(raw.barcode)) productId = ctx.productSkuMap.get(raw.barcode)!;
      else {
        const found = await prisma.product.findFirst({
          where: {
            OR: [
              { sku: externalSku },
              { sku: generatedSku },
              ...(raw.barcode ? [{ barcode: raw.barcode }] : [])
            ]
          },
          select: { id: true }
        });
        if (found) productId = found.id;
      }
    }

    const supplierPriceDec = raw.supplierPrice != null ? new Prisma.Decimal(raw.supplierPrice) : null;
    const stockQtyDec = new Prisma.Decimal(raw.stockQty || 0);

    // 3. YENİ ÜRÜN OLUŞTURMA
    if (!productId) {
      if (mode === 'PRICE_ONLY' || mode === 'STOCK_ONLY') {
        return { action: 'SKIPPED' };
      }

      const generatedSku = `${supplierCode}-${externalSku}`;
      const baseSlug = slugify(raw.name) || generatedSku.toLowerCase();
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

      // Satış Fiyatı Hesabı (Tedarikçi Fiyatı + %25 Kar Marjı)
      const costPrice = supplierPriceDec;
      const salePrice = costPrice ? costPrice.mul(1.25) : null;

      const newProduct = await prisma.product.create({
        data: {
          sku: generatedSku,
          name: raw.name,
          slug: uniqueSlug,
          barcode: raw.barcode || null,
          description: raw.description || `${raw.name} - Kaliteli Yedek Parça`,
          specsJson: raw.specs ? JSON.stringify(raw.specs) : null,
          status: 'ACTIVE',
          unit: raw.unit || 'ADET',
          vatRate: new Prisma.Decimal(20),
          currency: raw.supplierCurrency || 'TRY',
          costPrice,
          salePrice,
          stockQty: stockQtyDec,
          minOrderQty: new Prisma.Decimal(raw.minOrderQty || 1),
          brandId,
          categoryId,
          supplierId,
          ...(raw.imageUrls && raw.imageUrls.length > 0 ? {
            images: {
              create: raw.imageUrls.slice(0, 5).map((imgUrl, i) => ({
                url: imgUrl,
                originalUrl: imgUrl,
                sourceSupplier: supplierCode,
                sortOrder: i,
              }))
            }
          } : {})
        }
      });

      productId = newProduct.id;

      // SupplierProduct kaydı oluştur
      const createdSP = await prisma.supplierProduct.create({
        data: {
          supplierId,
          productId: newProduct.id,
          externalSku,
          barcode: raw.barcode || null,
          name: raw.name,
          brandName: raw.brand || null,
          categoryName: raw.category || null,
          subcategoryName: raw.subcategory || null,
          supplierPrice: supplierPriceDec,
          supplierCurrency: raw.supplierCurrency || 'TRY',
          stockQty: stockQtyDec,
          stockStatus: raw.stockStatus || (raw.stockQty && raw.stockQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
          specsJson: raw.specs ? JSON.stringify(raw.specs) : null,
          imagesJson: raw.imageUrls ? JSON.stringify(raw.imageUrls) : null,
          lastSyncedAt: new Date(),
        }
      });

      if (ctx) {
        ctx.supplierProductMap.set(externalSku, { id: createdSP.id, productId: newProduct.id });
        ctx.productSkuMap.set(generatedSku, newProduct.id);
        ctx.productSkuMap.set(externalSku, newProduct.id);
        if (raw.barcode) ctx.productSkuMap.set(raw.barcode, newProduct.id);
      }

      return { action: 'CREATED', productId };
    }

    // 4. MEVCUT ÜRÜNÜ GÜNCELLEME (FAST UPDATE)
    const productUpdateData: any = { updatedAt: new Date() };

    if (mode === 'FULL' || mode === 'STOCK_ONLY') {
      productUpdateData.stockQty = stockQtyDec;
    }

    if (mode === 'FULL' || mode === 'PRICE_ONLY') {
      if (supplierPriceDec) {
        productUpdateData.costPrice = supplierPriceDec;
      }
    }

    if (mode === 'FULL') {
      if (brandId) productUpdateData.brandId = brandId;
      if (categoryId) productUpdateData.categoryId = categoryId;
      if (raw.barcode) productUpdateData.barcode = raw.barcode;
    }

    await prisma.product.update({
      where: { id: productId },
      data: productUpdateData,
    });

    if (existingSupplierProductId) {
      await prisma.supplierProduct.update({
        where: { id: existingSupplierProductId },
        data: {
          supplierPrice: supplierPriceDec,
          stockQty: stockQtyDec,
          stockStatus: raw.stockStatus || (raw.stockQty && raw.stockQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
          lastSyncedAt: new Date(),
        }
      });
    }

    return { action: 'UPDATED', productId };
  }

  /**
   * Tedarikçi için tam senkronizasyon çalıştırma metodu (Turbo Paralel Motor).
   */
  async runSync(supplierCode: string, options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = new Date();
    const adapter = supplierFactory.getAdapter(supplierCode);
    const supplierId = await this.ensureSupplier(adapter.supplierCode, adapter.supplierName);

    // Create ImportJob record
    const job = await prisma.importJob.create({
      data: {
        supplierId,
        supplierCode: adapter.supplierCode,
        mode: options.mode || 'FULL',
        status: 'RUNNING',
        startedAt: startTime,
      }
    });

    const result: SyncResult = {
      jobId: job.id,
      supplierCode: adapter.supplierCode,
      status: 'RUNNING' as any,
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      startedAt: startTime,
      completedAt: new Date(),
    };

    try {
      console.log(`[Turbo Sync Engine] Starting ${options.mode || 'FULL'} sync for ${adapter.supplierName}...`);

      // 1. Fetch raw products from supplier adapter
      const rawProducts = await adapter.fetchProducts({
        ...options,
      });

      result.total = rawProducts.length;

      // 2. Pre-load fast in-memory context (1 roundtrip per table)
      const ctx = await this.loadSyncContext(supplierId);

      // 3. Process products in parallel chunks of 20
      const CHUNK_SIZE = 20;
      for (let i = 0; i < rawProducts.length; i += CHUNK_SIZE) {
        const chunk = rawProducts.slice(i, i + CHUNK_SIZE);
        
        await Promise.all(
          chunk.map(async (raw) => {
            try {
              const outcome = await this.upsertProduct(supplierId, adapter.supplierCode, raw, options.mode || 'FULL', ctx);
              if (outcome.action === 'CREATED') result.created++;
              else if (outcome.action === 'UPDATED') result.updated++;
              else result.skipped++;
            } catch (err: any) {
              result.failed++;
              result.errors.push({
                externalSku: raw.externalSku,
                productName: raw.name,
                error: err.message,
              });

              prisma.importError.create({
                data: {
                  jobId: job.id,
                  externalSku: raw.externalSku,
                  productName: raw.name,
                  errorMessage: err.message,
                }
              }).catch(() => {});
            }
          })
        );

        // Periodically update job progress in DB (every 100 items or end)
        if (i % 100 === 0 || i + CHUNK_SIZE >= rawProducts.length) {
          prisma.importJob.update({
            where: { id: job.id },
            data: {
              totalItems: result.total,
              createdItems: result.created,
              updatedItems: result.updated,
              skippedItems: result.skipped,
              failedItems: result.failed,
            }
          }).catch(() => {});
        }
      }

      result.status = 'COMPLETED';
      result.completedAt = new Date();

      // Final update to ImportJob
      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          totalItems: result.total,
          createdItems: result.created,
          updatedItems: result.updated,
          skippedItems: result.skipped,
          failedItems: result.failed,
          summaryMessage: `Başarıyla tamamlandı: ${result.created} yeni, ${result.updated} güncellendi, ${result.failed} hata.`,
          completedAt: result.completedAt,
        }
      });

      // Update Supplier timestamp
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { lastSyncedAt: new Date() }
      });

      console.log(`[Turbo Sync Engine] Finished in ${((Date.now() - startTime.getTime()) / 1000).toFixed(1)}s! Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`);

      return result;
    } catch (err: any) {
      result.status = 'FAILED';
      result.completedAt = new Date();

      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          summaryMessage: `Hata: ${err.message}`,
          completedAt: result.completedAt,
        }
      });

      throw err;
    }
  }
}

export const supplierSyncService = new SupplierSyncService();
