import { NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';

export async function POST() {
  await authService.logout();
  return NextResponse.json({ success: true, message: 'Çıkış yapıldı' });
}
