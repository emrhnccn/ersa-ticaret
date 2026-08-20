import type { SupplierAdapter } from './types';
import { girdapAdapter } from './girdap/adapter';
import { garantiisAdapter } from './garantiis/adapter';
import { kombisanAdapter } from './kombisan/adapter';

class SupplierFactory {
  private adapters = new Map<string, SupplierAdapter>();

  constructor() {
    this.register(girdapAdapter);
    this.register(garantiisAdapter);
    this.register(kombisanAdapter);
  }

  register(adapter: SupplierAdapter) {
    this.adapters.set(adapter.supplierCode.toUpperCase(), adapter);
  }

  getAdapter(supplierCode: string): SupplierAdapter {
    const adapter = this.adapters.get(supplierCode.toUpperCase());
    if (!adapter) {
      throw new Error(`Bilinmeyen tedarikçi kodu: "${supplierCode}". Desteklenenler: ${Array.from(this.adapters.keys()).join(', ')}`);
    }
    return adapter;
  }

  listAdapters(): Array<{ code: string; name: string }> {
    return Array.from(this.adapters.values()).map(a => ({
      code: a.supplierCode,
      name: a.supplierName,
    }));
  }
}

export const supplierFactory = new SupplierFactory();
