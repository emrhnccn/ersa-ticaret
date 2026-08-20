import { NextRequest, NextResponse } from 'next/server';
import { supplierSyncService } from '@/server/sync/supplier-sync-service';
import type { ImportMode } from '@/integrations/suppliers/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierCode, mode = 'FULL', limit, maxPages } = body;

    if (!supplierCode) {
      return NextResponse.json({ success: false, error: 'supplierCode parametresi zorunludur.' }, { status: 400 });
    }

    const result = await supplierSyncService.runSync(supplierCode.toUpperCase(), {
      mode: mode as ImportMode,
      limit: limit ? parseInt(limit, 10) : undefined,
      maxPages: maxPages ? parseInt(maxPages, 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Admin Supplier Sync API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
