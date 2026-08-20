import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/jwt';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
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

    if (user) {
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
  } catch (dbError) {
    console.warn('DB user lookup in /auth/me failed, falling back to JWT session:', dbError);
  }

  // Fallback to valid verified JWT session payload (Prevents F5 logout on network/cold-start glitches)
  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name || session.email.split('@')[0],
      role: session.role,
      status: 'ACTIVE',
      company: session.companyId ? {
        id: session.companyId,
        legalName: session.companyName || 'Bayi Hesabı',
        status: 'APPROVED',
        customerGroup: session.customerGroupId ? {
          id: session.customerGroupId,
          name: session.customerGroupCode || 'Özel Bayi Grubu',
          code: session.customerGroupCode || 'DEALER',
        } : null,
      } : null,
    }
  });
}
