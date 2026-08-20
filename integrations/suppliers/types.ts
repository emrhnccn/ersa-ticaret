export type ImportMode = 'FULL' | 'INCREMENTAL' | 'PRICE_ONLY' | 'STOCK_ONLY' | 'IMAGE_ONLY';

export interface RawSupplierProduct {
  externalSku: string;
  barcode?: string | null;
  name: string;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  supplierPrice?: number | null;
  supplierCurrency?: string;
  stockQty?: number;
  stockStatus?: string;
  imageUrls?: string[];
  specs?: Record<string, string>;
  oemCodes?: string[];
  minOrderQty?: number;
  unit?: string;
  rawPayload?: any;
}

export interface SyncOptions {
  mode?: ImportMode;
  maxPages?: number;
  limit?: number;
  categoryFilter?: string;
  onProgress?: (processed: number, total?: number) => void;
}

export interface SyncResult {
  jobId: string;
  supplierCode: string;
  status: 'COMPLETED' | 'FAILED';
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ externalSku?: string; productName?: string; error: string }>;
  startedAt: Date;
  completedAt: Date;
}

export interface SupplierAdapter {
  readonly supplierCode: string;
  readonly supplierName: string;

  /**
   * Tedarikçi sisteminde oturum açar ve oturum token/çerezini hazırlar.
   */
  login(): Promise<boolean>;

  /**
   * Tedarikçiden ürünleri çeker ve standart RawSupplierProduct formatında yield/döner.
   */
  fetchProducts(options?: SyncOptions): Promise<RawSupplierProduct[]>;
}
