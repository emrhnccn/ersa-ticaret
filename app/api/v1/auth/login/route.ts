import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';

export async function POST(req: NextRequest) {
  try {
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
