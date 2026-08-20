import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/server/orders/order-service';
import { getSessionUser } from '@/server/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const body = await req.json();

    const result = await orderService.createOrder({
      userId: session?.userId || null,
      companyId: session?.companyId || null,
      items: body.items,
      paymentMethod: body.paymentMethod || 'CREDIT_CARD',
      currency: body.currency || 'TRY',
      address: body.address,
      notes: body.notes,
      actorId: session?.userId || null,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Sipariş oluşturulamadı' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const orders = await orderService.getCustomerOrders(session.userId, session.companyId || undefined);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
