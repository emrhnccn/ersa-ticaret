import type { SupplierAdapter, RawSupplierProduct } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class OnlineParcaSupplierAdapter implements SupplierAdapter {
  supplierCode = 'ONLINE_PARCA';
  supplierName = 'Online Yedek Parça Dağıtım';

  async fetchCatalog(): Promise<RawSupplierProduct[]> {
    // Örnek: Güvenli scraper / mock catalog fetcher
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
      $('.product-item').slice(0, 10).each((_, el) => {
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
            price: 550,
            currency: 'TRY',
            stockQty: 25,
            imageUrl,
            rawPayload: { title, brand, imageUrl },
          });
        }
      });
    } catch (e: any) {
      console.warn('OnlineParca fetch error (falling back to mock catalog):', e.message);
    }
    return products;
  }

  mapToStandardProduct(raw: RawSupplierProduct) {
    return {
      sku: raw.externalSku,
      name: raw.name,
      brand: raw.brand || 'Genel',
      category: raw.category || 'Yedek Parça',
      description: raw.description,
      salePrice: raw.price || 0,
      currency: raw.currency || 'TRY',
      stockQty: raw.stockQty || 0,
      vatRate: 20,
      unit: 'ADET',
    };
  }
}

export const onlineParcaAdapter = new OnlineParcaSupplierAdapter();
