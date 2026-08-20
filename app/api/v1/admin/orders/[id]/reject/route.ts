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

    const body = await req.json().catch(() => ({}));
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams?.id || params?.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID parametresi eksik.' }, { status: 400 });
    }

    const rejectedOrder = await orderService.rejectOrder(orderId, session?.userId, body.reason);

    return NextResponse.json({
      success: true,
      message: 'Sipariş reddedildi ve stoklar iade edildi.',
      order: rejectedOrder,
    });
  } catch (error: any) {
    console.error('[Admin Order Reject Error]:', error);
    return NextResponse.json({ error: error.message || 'Reddetme işlemi başarısız' }, { status: 400 });
  }
}
