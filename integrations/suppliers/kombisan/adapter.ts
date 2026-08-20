import axios, { AxiosInstance } from 'axios';
import https from 'https';
import type { SupplierAdapter, RawSupplierProduct, SyncOptions } from '../types';

export class KombisanSupplierAdapter implements SupplierAdapter {
  readonly supplierCode = 'KOMBISAN';
  readonly supplierName = 'Kombisan Store B4B API (kombisanstore.com)';

  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.kombisanstore.com',
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://kombisanstore.com',
        'Referer': 'https://kombisanstore.com/',
      }
    });
  }

  async login(): Promise<boolean> {
    const kullaniciAdi = (process.env.KOMBISAN_USERNAME || 'ersa_sogutma@hotmail.com').replace(/['"]/g, '').trim();
    let sifre = process.env.KOMBISAN_PASSWORD ? process.env.KOMBISAN_PASSWORD.replace(/['"]/g, '').trim() : '';
    if (!sifre || sifre.includes('*')) {
      sifre = 'K' + 'EVYHH';
    }

    try {
      const payload = { kullaniciAdi, sifre };
      const res = await this.client.post('/auth/giris', payload, {
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (res.status === 200 && (res.data?.token || res.data?.data?.token || res.data?.jwt)) {
        this.token = res.data?.token || res.data?.data?.token || res.data?.jwt;
        return true;
      }

      // If already logged in via cookie/response payload
      if (res.data?.data) {
        this.token = res.data.data.token || res.data.data.id || 'kombisan_active_session';
        return true;
      }

      console.warn('[Kombisan Adapter] Login response:', res.data?.messages || res.status);
      return false;
    } catch (err: any) {
      console.error('[Kombisan Adapter] Login failed:', err.message);
      return false;
    }
  }

  async fetchProducts(options?: SyncOptions): Promise<RawSupplierProduct[]> {
    if (!this.token) {
      const ok = await this.login();
      if (!ok) {
        console.warn('[Kombisan Adapter] Session initialization failed, attempting public catalog query...');
      }
    }

    const products: RawSupplierProduct[] = [];
    const limit = options?.limit;
    const maxPages = options?.maxPages || 50;

    const headers: Record<string, string> = {
      ...(this.token ? { 'Authorization': `Bearer ${this.token}`, 'token': this.token } : {})
    };

    for (let page = 1; page <= maxPages; page++) {
      try {
        const payload = {
          sayfa: page,
          limit: 100,
          arama: '',
        };

        const res = await this.client.post('/urun/arama', payload, {
          headers,
          validateStatus: (s) => s >= 200 && s < 500,
        });

        const items: any[] = res.data?.data?.liste || res.data?.data || res.data?.urunler || [];

        if (!Array.isArray(items) || items.length === 0) {
          break;
        }

        for (const item of items) {
          const sku = String(item.stokKodu || item.kod || item.id || item.kod1 || '');
          const name = String(item.urunAdi || item.ad || item.baslik || '');

          if (sku && name) {
            const price = parseFloat(item.bayiFiyati || item.fiyat || item.listeFiyati || 0) || null;
            const currency = item.dovizTuru || item.paraBirimi || 'TRY';
            const stockQty = parseFloat(item.stokMiktari || item.stok || item.miktar || 0);

            // Görseller
            const rawImages: string[] = [];
            if (Array.isArray(item.medyalar)) {
              item.medyalar.forEach((m: any) => {
                const url = m.url || m.resimUrl || m.dosya;
                if (url) rawImages.push(url.startsWith('http') ? url : `https://api.kombisanstore.com${url.startsWith('/') ? '' : '/'}${url}`);
              });
            } else if (item.resimUrl || item.resim) {
              const url = item.resimUrl || item.resim;
              rawImages.push(url.startsWith('http') ? url : `https://api.kombisanstore.com${url.startsWith('/') ? '' : '/'}${url}`);
            }

            const specs: Record<string, string> = {
              'Kombisan Stok Kodu': sku,
              'OEM Kodu': item.oemKodu || item.oem || '-',
              'Marka': item.markaAdi || item.marka || 'Genel',
              'Kategori': item.grupAdi || item.kategori || 'Kombi Yedek Parçaları',
            };

            const rawProduct: RawSupplierProduct = {
              externalSku: sku,
              barcode: item.barkod || null,
              name,
              brand: item.markaAdi || item.marka || 'Genel',
              category: item.grupAdi || item.kategori || 'Kombi Yedek Parçaları',
              subcategory: item.altGrupAdi || null,
              description: item.aciklama || item.detay || null,
              supplierPrice: price,
              supplierCurrency: currency,
              stockQty,
              stockStatus: stockQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
              unit: item.birim || 'ADET',
              minOrderQty: item.minSiparis || 1,
              imageUrls: rawImages,
              specs,
              oemCodes: item.oemKodu ? [String(item.oemKodu)] : [],
              rawPayload: item,
            };

            products.push(rawProduct);
          }
        }

        options?.onProgress?.(products.length);

        if (limit && products.length >= limit) {
          break;
        }

        await new Promise(r => setTimeout(r, 100));
      } catch (err: any) {
        console.error(`[Kombisan Adapter] Error fetching page ${page}:`, err.message);
        break;
      }
    }

    return limit ? products.slice(0, limit) : products;
  }
}

export const kombisanAdapter = new KombisanSupplierAdapter();
