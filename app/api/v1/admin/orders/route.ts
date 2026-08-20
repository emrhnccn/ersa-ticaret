import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSessionUser } from '@/server/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (session && session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: status && status !== 'ALL' ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          include: {
            currentAccount: true,
          }
        },
        user: true,
        address: true,
        items: true,
      }
    });

    const formatted = orders.map(o => ({
      id: o.id,
      orderNo: o.orderNo,
      buyer: o.company?.legalName || o.user?.name || 'Müşteri',
      buyerPhone: o.user?.phone || o.company?.phone,
      buyerEmail: o.user?.email || o.company?.email,
      buyerType: o.buyerType,
      companyId: o.companyId,
      companyName: o.company?.legalName,
      creditLimit: o.company?.currentAccount?.creditLimit ? Number(o.company.currentAccount.creditLimit) : 0,
      grandTotal: Number(o.grandTotal),
      subtotalExVat: Number(o.subtotalExVat),
      vatTotal: Number(o.vatTotal),
      currency: o.currency,
      status: o.status,
      paymentMethod: o.paymentMethod,
      notes: o.notes,
      address: o.address ? `${o.address.line1}, ${o.address.district ? o.address.district + '/' : ''}${o.address.city}` : '',
      itemCount: o.items.length,
      items: o.items.map(i => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        quantity: Number(i.quantity),
        unitNetExVat: Number(i.unitNetExVat),
        lineGross: Number(i.lineGross),
      })),
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      success: true,
      orders: formatted,
    });
  } catch (error: any) {
    console.error('[Admin Orders API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
