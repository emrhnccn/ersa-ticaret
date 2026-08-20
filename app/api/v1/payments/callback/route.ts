import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGateway } from '@/integrations/payment/factory';
import { orderService } from '@/server/orders/order-service';
import { currentAccountService } from '@/server/current-account/current-account-service';
import { prisma } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pos = getPaymentGateway();
    const result = await pos.verifyCallback(body);

    if (result.status === 'PAID') {
      const payment = await prisma.payment.create({
        data: {
          provider: pos.providerName,
          providerRef: result.providerRef,
          purpose: body.purpose || 'ORDER',
          amount: result.amount,
          currency: result.currency,
          status: 'PAID',
          orderId: body.orderId || null,
          companyId: body.companyId || null,
          userId: body.userId || null,
          rawPayload: JSON.stringify(result.rawPayload),
        }
      });

      // Eğer sipariş ödemesi ise
      if (body.orderId) {
        await orderService.completePaidOrder(body.orderId, payment.providerRef || payment.id);
      }

      // Eğer cari bakiye ödemesi ise
      if (body.purpose === 'CURRENT_ACCOUNT' && body.companyId) {
        await currentAccountService.recordTransaction({
          companyId: body.companyId,
          type: 'CREDIT',
          amount: result.amount,
          paymentId: payment.id,
          note: `Sanal POS Cari Tahsilat (Ref: ${payment.providerRef})`,
        });
      }

      return NextResponse.json({ success: true, paymentId: payment.id });
    }

    return NextResponse.json({ success: false, error: 'Ödeme başarısız' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
