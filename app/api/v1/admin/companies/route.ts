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

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customerGroup: true,
        currentAccount: true,
        members: { include: { user: true } },
      }
    });

    return NextResponse.json({
      companies: companies.map(c => ({
        id: c.id,
        legalName: c.legalName,
        taxNo: c.taxNo,
        taxOffice: c.taxOffice,
        phone: c.phone,
        email: c.email,
        status: c.status,
        customerGroup: c.customerGroup,
        creditLimit: Number(c.currentAccount?.creditLimit || 0),
        members: c.members.map(m => ({
          name: m.user.name,
          email: m.user.email,
          role: m.memberRole,
        })),
        createdAt: c.createdAt,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const { companyId, status, customerGroupId, creditLimit } = body;

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(status ? { status } : {}),
        ...(customerGroupId ? { customerGroupId } : {}),
      }
    });

    if (creditLimit !== undefined) {
      await prisma.currentAccount.upsert({
        where: { companyId },
        update: { creditLimit: Number(creditLimit) },
        create: { companyId, creditLimit: Number(creditLimit) },
      });
    }

    await recordAuditLog({
      actorId: session.userId,
      action: 'ADMIN_UPDATE_COMPANY',
      entityType: 'Company',
      entityId: companyId,
      afterJson: JSON.stringify({ status, customerGroupId, creditLimit }),
    });

    return NextResponse.json({ company: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
