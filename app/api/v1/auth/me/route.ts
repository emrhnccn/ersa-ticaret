import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/jwt';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      memberships: {
        include: {
          company: {
            include: {
              customerGroup: true,
              currentAccount: true,
            }
          }
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const membership = user.memberships[0];
  const company = membership?.company;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      company: company ? {
        id: company.id,
        legalName: company.legalName,
        taxNo: company.taxNo,
        taxOffice: company.taxOffice,
        status: company.status,
        customerGroup: company.customerGroup ? {
          id: company.customerGroup.id,
          name: company.customerGroup.name,
          code: company.customerGroup.code,
        } : null,
        currentAccount: company.currentAccount ? {
          creditLimit: Number(company.currentAccount.creditLimit),
        } : null,
      } : null,
    }
  });
}
