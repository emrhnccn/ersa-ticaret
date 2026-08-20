import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSessionUser } from '@/server/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const [
      totalProducts,
      totalOrders,
      totalCompanies,
      pendingCompanies,
      totalRevenue,
      recentOrders,
      recentLogs,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.company.count(),
      prisma.company.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERED', 'SHIPPED'] } }
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { company: true, user: true },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { name: true, email: true } } }
      })
    ]);

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalOrders,
        totalCompanies,
        pendingCompanies,
        totalRevenue: Number(totalRevenue._sum.grandTotal || 0),
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNo: o.orderNo,
        buyer: o.company?.legalName || o.user?.name || 'Müşteri',
        buyerType: o.buyerType,
        grandTotal: Number(o.grandTotal),
        currency: o.currency,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
      recentLogs: recentLogs.map(l => ({
        id: l.id,
        actor: l.actor?.name || 'Sistem',
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        createdAt: l.createdAt,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
