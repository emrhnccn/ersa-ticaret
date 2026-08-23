import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';
import { checkRateLimit, getClientIp } from '@/server/security/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`register_${ip}`, { windowMs: 60000, maxRequests: 3 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla kayıt denemesi yapıldı. Lütfen biraz sonra tekrar deneyiniz.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = await authService.registerB2C({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kayıt oluşturulamadı' },
      { status: 400 }
    );
  }
}
