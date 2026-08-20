import type { SupplierAdapter } from './types';
import { onlineParcaAdapter } from './online-parca/adapter';

const supplierRegistry = new Map<string, SupplierAdapter>();
supplierRegistry.set('ONLINE_PARCA', onlineParcaAdapter);

export function getSupplierAdapter(code: string): SupplierAdapter | null {
  return supplierRegistry.get(code.toUpperCase()) || null;
}

export function getAllSupplierAdapters(): SupplierAdapter[] {
  return Array.from(supplierRegistry.values());
}
