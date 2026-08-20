import { prisma } from '../db';
import { supplierFactory } from '../../integrations/suppliers/factory';
import type { RawSupplierProduct, SyncOptions, SyncResult, ImportMode } from '../../integrations/suppliers/types';
import { Decimal } from '@prisma/client/runtime/library';

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
   * Kategori eşleştirmesi veya otomatik oluşturma.
   */
  private async resolveCategory(supplierId: string, rawCategoryName?: string | null): Promise<string | null> {
    if (!rawCategoryName) return null;

    const trimmed = rawCategoryName.trim();
    if (!trimmed) return null;

    // 1. Check existing mapping
    const mapping = await prisma.supplierCategoryMapping.findUnique({
      where: {
        supplierId_supplierCategoryName: {
          supplierId,
          supplierCategoryName: trimmed,
        }
      }
    });

    if (mapping && mapping.targetCategoryId) {
      return mapping.targetCategoryId;
    }

    // 2. Try to find existing category in Ersa database
    const slug = slugify(trimmed) || 'kategori';
    let cat = await prisma.category.findFirst({
      where: {
        OR: [{ name: trimmed }, { slug }]
      }
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

    // Save mapping for next time
    await prisma.supplierCategoryMapping.upsert({
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
    });

    return cat.id;
  }

  /**
   * Marka eşleştirmesi veya otomatik oluşturma.
   */
  private async resolveBrand(rawBrandName?: string | null): Promise<string | null> {
    if (!rawBrandName) return null;
    const trimmed = rawBrandName.trim();
    if (!trimmed || trimmed.toLowerCase() === 'genel' || trimmed.toLowerCase() === 'universal') {
      return null;
    }

    const slug = slugify(trimmed) || 'marka';
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [{ name: trimmed }, { slug }]
      }
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: trimmed,
          slug: `${slug}-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
        }
      });
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
    mode: ImportMode = 'FULL'
  ): Promise<{ action: 'CREATED' | 'UPDATED' | 'SKIPPED'; productId?: string }> {
    const externalSku = raw.externalSku.trim();
    if (!externalSku) {
      throw new Error('Ürünün tedarikçi stok kodu (SKU) boş olamaz.');
    }

    // 1. Tedarikçi Kategori ve Marka Çözümleme
    const categoryId = await this.resolveCategory(supplierId, raw.subcategory || raw.category);
    const brandId = await this.resolveBrand(raw.brand);

    // 2. Mevcut SupplierProduct kaydını kontrol et
    const existingSupplierProduct = await prisma.supplierProduct.findUnique({
      where: {
        supplierId_externalSku: {
          supplierId,
          externalSku,
        }
      },
      include: { product: true }
    });

    let productId = existingSupplierProduct?.productId || null;

    // 3. Eğer SupplierProduct yoksa veya bağlı Product yoksa, Ersa veritabanında SKU veya Barkod ile ara
    if (!productId) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: externalSku },
            { sku: `${supplierCode}-${externalSku}` },
            ...(raw.barcode ? [{ barcode: raw.barcode }] : [])
          ]
        }
      });

      if (existingProduct) {
        productId = existingProduct.id;
      }
    }

    const supplierPriceDec = raw.supplierPrice != null ? new Decimal(raw.supplierPrice) : null;
    const stockQtyDec = new Decimal(raw.stockQty || 0);

    // 4. EĞER ÜRÜN ERSA VERİTABANINDA YOKSA -> OLUŞTUR (Yalnızca FULL veya INCREMENTAL modda)
    if (!productId) {
      if (mode === 'PRICE_ONLY' || mode === 'STOCK_ONLY') {
        return { action: 'SKIPPED' };
      }

      const generatedSku = `${supplierCode}-${externalSku}`;
      const baseSlug = slugify(raw.name) || generatedSku.toLowerCase();
      const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Ersa satış fiyatını belirle (Varsayılan: Tedarikçi Fiyatı + %25 Kar Marjı)
      const costPrice = supplierPriceDec;
      const salePrice = costPrice ? costPrice.mul(1.25) : null;

      const newProduct = await prisma.product.create({
        data: {
          sku: generatedSku,
          name: raw.name,
          slug: uniqueSlug,
          barcode: raw.barcode || null,
          description: raw.description || `${raw.name} - Orijinal / Yüksek Kaliteli Yedek Parça`,
          specsJson: raw.specs ? JSON.stringify(raw.specs) : null,
          status: 'ACTIVE',
          unit: raw.unit || 'ADET',
          vatRate: new Decimal(20),
          currency: raw.supplierCurrency || 'TRY',
          costPrice,
          salePrice,
          stockQty: stockQtyDec,
          minOrderQty: new Decimal(raw.minOrderQty || 1),
          brandId,
          categoryId,
          supplierId,
        }
      });

      productId = newProduct.id;

      // Fotoğrafları ekle
      if (raw.imageUrls && raw.imageUrls.length > 0) {
        for (let i = 0; i < raw.imageUrls.length; i++) {
          const imgUrl = raw.imageUrls[i];
          await prisma.productImage.create({
            data: {
              productId: newProduct.id,
              url: imgUrl,
              originalUrl: imgUrl,
              sourceSupplier: supplierCode,
              sortOrder: i,
            }
          });
        }
      }

      // SupplierProduct bağlantısını oluştur
      await prisma.supplierProduct.create({
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
          rawPayload: raw.rawPayload ? JSON.stringify(raw.rawPayload) : null,
          lastSyncedAt: new Date(),
        }
      });

      return { action: 'CREATED', productId: newProduct.id };
    }

    // 5. EĞER ÜRÜN ZATEN VARSA -> GÜNCELLE (UPSERT)
    // SupplierProduct tablosunu güncelle
    await prisma.supplierProduct.upsert({
      where: {
        supplierId_externalSku: {
          supplierId,
          externalSku,
        }
      },
      update: {
        productId,
        name: raw.name,
        barcode: raw.barcode || undefined,
        brandName: raw.brand || undefined,
        categoryName: raw.category || undefined,
        subcategoryName: raw.subcategory || undefined,
        supplierPrice: supplierPriceDec,
        supplierCurrency: raw.supplierCurrency || 'TRY',
        stockQty: stockQtyDec,
        stockStatus: raw.stockStatus || (raw.stockQty && raw.stockQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
        specsJson: raw.specs ? JSON.stringify(raw.specs) : undefined,
        imagesJson: raw.imageUrls ? JSON.stringify(raw.imageUrls) : undefined,
        rawPayload: raw.rawPayload ? JSON.stringify(raw.rawPayload) : undefined,
        lastSyncedAt: new Date(),
      },
      create: {
        supplierId,
        productId,
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
        rawPayload: raw.rawPayload ? JSON.stringify(raw.rawPayload) : null,
        lastSyncedAt: new Date(),
      }
    });

    // Ersa Product tablosunu moduna göre güncelle
    const productUpdateData: any = {
      updatedAt: new Date(),
    };

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

    // Fotoğrafları kontrol et (yoksa ekle)
    if ((mode === 'FULL' || mode === 'IMAGE_ONLY') && raw.imageUrls && raw.imageUrls.length > 0) {
      const existingImages = await prisma.productImage.findMany({
        where: { productId },
        select: { originalUrl: true, url: true }
      });
      const existingUrls = new Set(existingImages.map(i => i.originalUrl || i.url));

      for (let i = 0; i < raw.imageUrls.length; i++) {
        const imgUrl = raw.imageUrls[i];
        if (!existingUrls.has(imgUrl)) {
          await prisma.productImage.create({
            data: {
              productId,
              url: imgUrl,
              originalUrl: imgUrl,
              sourceSupplier: supplierCode,
              sortOrder: existingImages.length + i,
            }
          });
        }
      }
    }

    return { action: 'UPDATED', productId };
  }

  /**
   * Tedarikçi için tam senkronizasyon çalıştırma metodu.
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
      console.log(`[Sync Engine] Starting ${options.mode || 'FULL'} sync for ${adapter.supplierName}...`);
      
      // 1. Fetch raw products
      const rawProducts = await adapter.fetchProducts({
        ...options,
        onProgress: (count) => {
          // Can emit websocket or console log
        }
      });

      result.total = rawProducts.length;

      // 2. Ingest into database
      for (const raw of rawProducts) {
        try {
          const outcome = await this.upsertProduct(supplierId, adapter.supplierCode, raw, options.mode || 'FULL');
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

          // Log to ImportError table
          await prisma.importError.create({
            data: {
              jobId: job.id,
              externalSku: raw.externalSku,
              productName: raw.name,
              errorMessage: err.message,
              detailsJson: JSON.stringify(raw),
            }
          });
        }
      }

      result.status = 'COMPLETED';
      result.completedAt = new Date();

      // Update ImportJob record
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

      // Update Supplier last synced timestamp
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { lastSyncedAt: new Date() }
      });

      console.log(`[Sync Engine] Finished sync for ${adapter.supplierName}. Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`);

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
