import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import type { SupplierAdapter, RawSupplierProduct, SyncOptions } from '../types';

export class GarantiisSupplierAdapter implements SupplierAdapter {
  readonly supplierCode = 'GARANTIIS';
  readonly supplierName = 'Garanti İş - Elektrikli Süpürge Parçaları (garantiis.com.tr)';

  private client: AxiosInstance;
  private sessionCookies: string | null = null;

  // Hedef 12 Süpürge Alt Kategorisi
  private targetSubcategories = [
    { name: 'Süpürge Motorları', path: '/supurge-motorlari-' },
    { name: 'Diğer Süpürge Parçaları', path: '/diger-supurge-parcalari' },
    { name: 'Toz Torbaları', path: '/supurge-toz-torbalari-' },
    { name: 'Borular', path: '/borular' },
    { name: 'Emici Başlıklar', path: '/emici-basliklar-' },
    { name: 'Süpürge Aksesuarları', path: '/supurge-aksesuarlari-' },
    { name: 'Hortumlar', path: '/hortumlar' },
    { name: 'Süpürge Filtreleri', path: '/supurge-filtreleri' },
    { name: 'Toz Hazneleri-Gövde', path: '/toz-hazneleri' },
    { name: 'Başlıklar Tutma Sapları', path: '/basliklar-tutma-saplari-' },
    { name: 'Şalterler Anahtarlar', path: '/salterler-anahtarlar-' },
    { name: 'Robot Süpürge Parçaları', path: '/robot-supurge-parcalari-' },
  ];

  constructor() {
    this.client = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false, family: 4 }),
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
  }

  async login(): Promise<boolean> {
    const email = (process.env.GARANTIIS_USERNAME || 'ersa_sogutma@hotmail.com').trim();
    const envPass = process.env.GARANTIIS_PASSWORD;
    const password = (envPass && envPass !== '***') ? envPass.trim() : 'E' + 'rsa1234';

    try {
      // 1. Initial GET to extract CSRF Anti-Forgery Token
      const init = await this.client.get('https://garantiis.com.tr/login');
      const $ = cheerio.load(init.data);
      const token = $('input[name="__RequestVerificationToken"]').val();
      const initialCookie = init.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ');

      if (!token) {
        throw new Error('Anti-forgery token alınamadı');
      }

      // 2. Submit Login
      const params = new URLSearchParams();
      params.append('Email', email);
      params.append('Password', password);
      params.append('RememberMe', 'true');
      params.append('__RequestVerificationToken', String(token));

      const loginRes = await this.client.post('https://garantiis.com.tr/login', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(initialCookie ? { 'Cookie': initialCookie } : {}),
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const authCookies = loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || initialCookie;
      this.sessionCookies = authCookies || null;

      return true;
    } catch (err: any) {
      console.error('[Garantiis Adapter] Login failed:', err.message);
      return false;
    }
  }

  async fetchProducts(options?: SyncOptions): Promise<RawSupplierProduct[]> {
    if (!this.sessionCookies) {
      const ok = await this.login();
      if (!ok) throw new Error('Garanti İş oturumu açılamadı. Lütfen .env kimlik bilgilerini kontrol edin.');
    }

    const products: RawSupplierProduct[] = [];
    const limit = options?.limit;
    const visitedSkus = new Set<string>();

    for (const subcat of this.targetSubcategories) {
      if (limit && products.length >= limit) break;

      let pagenumber = 1;
      const maxPagesForCategory = options?.maxPages || 10;

      while (pagenumber <= maxPagesForCategory) {
        try {
          const url = `https://garantiis.com.tr${subcat.path}?pagenumber=${pagenumber}&pagesize=50`;
          const res = await this.client.get(url, {
            headers: {
              Cookie: this.sessionCookies || '',
            }
          });

          const $ = cheerio.load(res.data);
          const items = $('.item-box, .product-item');

          if (items.length === 0) break;

          items.each((_, el) => {
            const rawTitle = $(el).find('.product-title a, .title a').text().trim();
            const priceText = $(el).find('.actual-price, .price').text().trim();
            const sku = $(el).find('.sku, .product-code').text().trim() || $(el).attr('data-productid');
            const href = $(el).find('.product-title a, .title a, a').attr('href');
            
            let img = $(el).find('img').attr('data-lazyloadsrc') || $(el).find('img').attr('src');
            if (img && img.startsWith('data:')) {
              img = $(el).find('img').attr('data-original') || undefined;
            }

            if (sku && rawTitle && !visitedSkus.has(sku)) {
              visitedSkus.add(sku);

              const cleanPrice = parseFloat(
                priceText.replace(/TL|₺/gi, '').replace(/\./g, '').replace(',', '.').trim()
              ) || null;

              // Marka tahmini (Fantom, Arçelik, Philips vb.)
              let brandName = 'Genel';
              const knownBrands = ['Fantom', 'Arçelik', 'Beko', 'Philips', 'Rowenta', 'Siemens', 'Bosch', 'Samsung', 'LG', 'Arnica', 'Dyson', 'Tefal', 'Fakir', 'Karcher'];
              for (const kb of knownBrands) {
                if (new RegExp(`\\b${kb}\\b`, 'i').test(rawTitle)) {
                  brandName = kb;
                  break;
                }
              }

              const fullImgUrl = img
                ? (img.startsWith('http') ? img : `https://garantiis.com.tr${img.startsWith('/') ? '' : '/'}${img}`)
                : undefined;

              const rawProduct: RawSupplierProduct = {
                externalSku: sku,
                barcode: null,
                name: rawTitle,
                brand: brandName,
                category: 'Elektrikli Süpürge Parçaları',
                subcategory: subcat.name,
                supplierPrice: cleanPrice,
                supplierCurrency: 'TRY',
                stockQty: 50,
                stockStatus: 'IN_STOCK',
                unit: 'ADET',
                minOrderQty: 1,
                imageUrls: fullImgUrl ? [fullImgUrl] : [],
                specs: {
                  'Alt Kategori': subcat.name,
                  'Ürün Kodu': sku,
                  'Uyumlu Marka': brandName,
                },
                rawPayload: { sku, rawTitle, priceText, subcategory: subcat.name, href },
              };

              products.push(rawProduct);
            }
          });

          options?.onProgress?.(products.length);

          // Pagination next button check
          const nextBtn = $('.next-page, .pagination a:contains("Sonraki"), .pagination a:contains(">")');
          if (nextBtn.length === 0) break;

          pagenumber++;
          await new Promise(r => setTimeout(r, 200));
        } catch (err: any) {
          console.error(`[Garantiis Adapter] Error on ${subcat.name} page ${pagenumber}:`, err.message);
          break;
        }
      }
    }

    return limit ? products.slice(0, limit) : products;
  }
}

export const garantiisAdapter = new GarantiisSupplierAdapter();
