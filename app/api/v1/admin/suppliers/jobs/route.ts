import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierCode = searchParams.get('supplierCode');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const jobs = await prisma.importJob.findMany({
      where: supplierCode ? { supplierCode: supplierCode.toUpperCase() } : undefined,
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        supplier: {
          select: { name: true, code: true }
        },
        errors: {
          take: 5,
          select: {
            id: true,
            externalSku: true,
            productName: true,
            errorMessage: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    console.error('[Admin Supplier Jobs API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
