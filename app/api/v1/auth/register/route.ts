import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';

export async function POST(req: NextRequest) {
  try {
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
