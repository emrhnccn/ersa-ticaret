import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';
import { checkRateLimit, getClientIp } from '@/server/security/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`login_${ip}`, { windowMs: 60000, maxRequests: 5 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla hatalı deneme yapıldı. Lütfen 1 dakika sonra tekrar deneyiniz.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = await authService.login({
      email: body.email,
      password: body.password,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Giriş yapılamadı' },
      { status: 400 }
    );
  }
}
