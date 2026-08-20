import { NextRequest, NextResponse } from 'next/server';
import { currentAccountService } from '@/server/current-account/current-account-service';
import { getSessionUser } from '@/server/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || !session.companyId) {
      return NextResponse.json(
        { error: 'Cari hesap bilgileri yalnızca onaylı kurumsal B2B hesapları içindir.' },
        { status: 403 }
      );
    }

    const account = await currentAccountService.getAccount(session.companyId);
    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
