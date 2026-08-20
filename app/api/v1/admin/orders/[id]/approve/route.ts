import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/server/orders/order-service';
import { getSessionUser } from '@/server/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionUser(req);
    if (session && session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const orderId = params.id;
    const approvedOrder = await orderService.approveOrder(orderId, session?.userId);

    return NextResponse.json({
      success: true,
      message: 'Cari sipariş başarıyla onaylandı. Borç deftere işlendi ve fatura/kargo süreci başlatıldı.',
      order: approvedOrder,
    });
  } catch (error: any) {
    console.error('[Admin Order Approve Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
