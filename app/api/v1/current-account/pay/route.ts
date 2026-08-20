import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/jwt';
import { getPaymentGateway } from '@/integrations/payment/factory';
import { currentAccountService } from '@/server/current-account/current-account-service';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Geçersiz ödeme tutarı' }, { status: 400 });
    }

    const account = await currentAccountService.getAccount(session.companyId);

    const pos = getPaymentGateway();
    const posResponse = await pos.initiatePayment({
      companyId: session.companyId,
      userId: session.userId,
      purpose: 'CURRENT_ACCOUNT',
      amount,
      currency: 'TRY',
      customerName: account.companyName,
      customerEmail: session.email,
      callbackUrl: '/api/v1/payments/callback',
    });

    return NextResponse.json({
      paymentUrl: posResponse.redirectUrl,
      paymentId: posResponse.paymentId,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ödeme başlatılamadı' }, { status: 500 });
  }
}
