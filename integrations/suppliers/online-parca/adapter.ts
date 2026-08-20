import type { SupplierAdapter, RawSupplierProduct, SyncOptions } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class OnlineParcaSupplierAdapter implements SupplierAdapter {
  readonly supplierCode = 'ONLINE_PARCA';
  readonly supplierName = 'Online Yedek Parça Dağıtım';

  async login(): Promise<boolean> {
    return true;
  }

  async fetchProducts(options?: SyncOptions): Promise<RawSupplierProduct[]> {
    const products: RawSupplierProduct[] = [];
    try {
      const targetUrl = 'https://www.online-yedekparca.com/kombi-yedek-parca';
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const limit = options?.limit || 10;
      $('.product-item').slice(0, limit).each((_, el) => {
        const title = $(el).find('.productDescription').text().trim();
        const brand = $(el).find('.productBrand').text().trim() || 'Genel';
        let imageUrl = $(el).find('.imgInner img').attr('data-src') || $(el).find('.imgInner img').attr('src');
        if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

        if (title) {
          const sku = `OP-${Math.floor(10000 + Math.random() * 90000)}`;
          products.push({
            externalSku: sku,
            name: title,
            brand,
            category: 'Kombi Parçaları',
            description: `${brand} marka kombi yedek parçası.`,
            supplierPrice: 550,
            supplierCurrency: 'TRY',
            stockQty: 25,
            imageUrls: imageUrl ? [imageUrl] : [],
            rawPayload: { title, brand, imageUrl },
          });
        }
      });
    } catch (e: any) {
      console.warn('OnlineParca fetch error:', e.message);
    }
    return products;
  }
}

export const onlineParcaAdapter = new OnlineParcaSupplierAdapter();
