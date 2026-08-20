import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/auth/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.applyB2B({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      legalName: body.legalName,
      taxNo: body.taxNo,
      taxOffice: body.taxOffice,
      addressLine: body.addressLine || body.address || '',
      city: body.city || 'Kocaeli',
      district: body.district || 'Gebze',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Başvuru alınamadı' },
      { status: 400 }
    );
  }
}
