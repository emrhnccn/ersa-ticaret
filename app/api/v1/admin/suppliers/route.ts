import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { supplierFactory } from '@/integrations/suppliers/factory';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const registeredAdapters = supplierFactory.listAdapters();
    
    // Ensure all registered suppliers exist in database
    for (const a of registeredAdapters) {
      await prisma.supplier.upsert({
        where: { code: a.code },
        update: { name: a.name },
        create: { code: a.code, name: a.name, active: true },
      });
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            sourceProducts: true,
            importJobs: true,
          }
        },
        importJobs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        }
      }
    });

    const formatted = suppliers.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      active: s.active,
      lastSyncedAt: s.lastSyncedAt,
      productCount: s._count.sourceProducts,
      jobCount: s._count.importJobs,
      lastJob: s.importJobs[0] || null,
    }));

    return NextResponse.json({
      success: true,
      suppliers: formatted,
    });
  } catch (error: any) {
    console.error('[Admin Suppliers API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
