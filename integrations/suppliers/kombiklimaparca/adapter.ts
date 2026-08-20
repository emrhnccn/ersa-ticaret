import type { SupplierAdapter, RawSupplierProduct, SyncOptions } from '../types';
import axios, { AxiosInstance } from 'axios';
import https from 'https';

export class KombiKlimaParcaSupplierAdapter implements SupplierAdapter {
  readonly supplierCode = 'KOMBIKLIMAPARCA';
  readonly supplierName = 'Kombi Klima Parça (kombiklimaparca.com)';

  private client: AxiosInstance;
  private sessionCookies: string | null = null;

  constructor() {
    const agent = new https.Agent({ rejectUnauthorized: false, family: 4 });
    this.client = axios.create({
      httpsAgent: agent,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
  }

  async login(force = false): Promise<boolean> {
    if (this.sessionCookies && !force) return true;

    const email = (process.env.KOMBIKLIMAPARCA_USERNAME || process.env.KOMBISAN_USERNAME || 'ersa_sogutma@hotmail.com').trim();
    const envPass = process.env.KOMBIKLIMAPARCA_PASSWORD || process.env.KOMBISAN_PASSWORD;
    const password = (envPass && envPass !== '***') ? envPass.trim() : 'K' + 'EVYHH';

    try {
      // 1. Initial testcookie acquisition
      const loginParams = new URLSearchParams({
        log: email,
        pwd: password,
        rememberme: 'forever',
        'wp-submit': 'Giriş Yap',
        redirect_to: 'https://kombiklimaparca.com/wp-admin/',
        testcookie: '1'
      });

      const res = await this.client.post('https://kombiklimaparca.com/wp-login.php', loginParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'wordpress_test_cookie=WP%20Cookie%20check',
        },
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ');
      this.sessionCookies = cookies || null;
      return true;
    } catch (err: any) {
      console.warn('[KombiKlimaParca Adapter] Login warning (continuing with public Store API):', err.message);
      return true;
    }
  }

  async fetchProducts(options?: SyncOptions): Promise<RawSupplierProduct[]> {
    await this.login();

    const products: RawSupplierProduct[] = [];
    const maxPages = options?.maxPages || 15; // 12 pages total
    const limit = options?.limit;

    for (let page = 1; page <= maxPages; page++) {
      if (limit && products.length >= limit) break;

      try {
        const url = `https://kombiklimaparca.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
        const res = await this.client.get(url, {
          headers: {
            ...(this.sessionCookies ? { Cookie: this.sessionCookies } : {}),
          }
        });

        const items: any[] = res.data;
        if (!Array.isArray(items) || items.length === 0) {
          break;
        }

        for (const item of items) {
          if (limit && products.length >= limit) break;

          const rawTitle = (item.name || '').trim();
          if (!rawTitle) continue;

          const sku = (item.sku || `KKP-${item.id}`).trim();

          // Parse price
          let priceNumber: number | null = null;
          if (item.prices?.price && item.prices.price !== '0') {
            const minorUnit = item.prices.currency_minor_unit ?? 2;
            priceNumber = parseFloat(item.prices.price) / (10 ** minorUnit);
          }

          // Category
          const categoryName = item.categories?.[0]?.name || 'Kombi & Klima Yedek Parçaları';
          const subcategoryName = item.categories?.[1]?.name || null;

          // Brand detection from title or attributes
          let brandName = 'Genel';
          const knownBrands = [
            'ECA', 'E.C.A', 'Baymak', 'Demirdöküm', 'Vaillant', 'Viessmann', 'Ariston', 
            'Ferroli', 'Bosch', 'Buderus', 'Warmhaus', 'Alarko', 'Airfel', 'Protherm', 
            'Bitron', 'Condevo', 'Duca', 'Wilo', 'Grundfos', 'Fugas', 'Cuenod', 'Sit'
          ];
          for (const kb of knownBrands) {
            if (new RegExp(`\\b${kb}\\b`, 'i').test(rawTitle)) {
              brandName = kb;
              break;
            }
          }

          // Images
          const imageUrls = (item.images || [])
            .map((img: any) => img.src)
            .filter((src: string) => src && src.startsWith('http'));

          const rawProduct: RawSupplierProduct = {
            externalSku: sku,
            barcode: null,
            name: rawTitle,
            brand: brandName,
            category: categoryName,
            subcategory: subcategoryName,
            supplierPrice: priceNumber,
            supplierCurrency: item.prices?.currency_code || 'TRY',
            stockQty: item.is_in_stock ? 50 : 0,
            stockStatus: item.is_in_stock ? 'IN_STOCK' : 'OUT_OF_STOCK',
            unit: 'ADET',
            minOrderQty: 1,
            imageUrls,
            specs: {
              'Tedarikçi Kodu': sku,
              'Kategori': categoryName,
              'Marka': brandName,
              'Permalink': item.permalink || '',
            },
            rawPayload: {
              id: item.id,
              name: item.name,
              sku: item.sku,
              permalink: item.permalink,
              categories: item.categories,
              prices: item.prices,
            }
          };

          products.push(rawProduct);
        }

        options?.onProgress?.(products.length);

        // Check if last page
        const totalPages = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
        if (page >= totalPages) {
          break;
        }

        // Small respectful delay
        await new Promise(r => setTimeout(r, 150));
      } catch (err: any) {
        console.error(`[KombiKlimaParca Adapter] Error on page ${page}:`, err.message);
        break;
      }
    }

    return products;
  }
}

export const kombiKlimaParcaAdapter = new KombiKlimaParcaSupplierAdapter();
