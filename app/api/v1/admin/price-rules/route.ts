import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSessionUser } from '@/server/auth/jwt';
import { recordAuditLog } from '@/server/audit/audit-service';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const rules = await prisma.priceRule.findMany({
      orderBy: { priority: 'asc' },
      include: {
        customerGroup: true,
        company: true,
        product: true,
        brand: true,
        category: true,
      }
    });

    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const rule = await prisma.priceRule.create({
      data: {
        name: body.name,
        priority: Number(body.priority || 5),
        type: body.type,
        customerGroupId: body.customerGroupId || null,
        companyId: body.companyId || null,
        productId: body.productId || null,
        brandId: body.brandId || null,
        categoryId: body.categoryId || null,
        discountPercent: body.discountPercent ? Number(body.discountPercent) : null,
        specialPrice: body.specialPrice ? Number(body.specialPrice) : null,
        minQty: body.minQty ? Number(body.minQty) : null,
        active: body.active !== undefined ? body.active : true,
      }
    });

    await recordAuditLog({
      actorId: session.userId,
      action: 'CREATE_PRICE_RULE',
      entityType: 'PriceRule',
      entityId: rule.id,
      afterJson: JSON.stringify(rule),
    });

    return NextResponse.json({ rule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
