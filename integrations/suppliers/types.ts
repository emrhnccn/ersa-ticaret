export interface RawSupplierProduct {
  externalSku: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number;
  currency?: string;
  stockQty?: number;
  imageUrl?: string;
  rawPayload?: any;
}

export interface SupplierSyncResult {
  supplierCode: string;
  totalFetched: number;
  created: number;
  updated: number;
  errors: string[];
}

export interface SupplierAdapter {
  supplierCode: string;
  supplierName: string;
  fetchCatalog(): Promise<RawSupplierProduct[]>;
  mapToStandardProduct(raw: RawSupplierProduct): any;
}
