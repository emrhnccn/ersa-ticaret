import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie, clearAuthCookie, type TokenPayload } from './jwt';
import { recordAuditLog } from '../audit/audit-service';

export interface LoginParams {
  email: string;
  password?: string;
}

export interface RegisterB2CParams {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}

export interface ApplyB2BParams {
  email: string;
  password?: string;
  name: string;
  phone: string;
  legalName: string;
  taxNo: string;
  taxOffice: string;
  addressLine: string;
  city: string;
  district?: string;
}

export const authService = {
  async login({ email, password }: LoginParams) {
    if (!email || !password) {
      throw new Error('E-posta ve şifre zorunludur.');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
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

    if (!user || !user.passwordHash) {
      throw new Error('Geçersiz e-posta veya şifre.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Geçersiz e-posta veya şifre.');
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('Hesabınız askıya alınmıştır. Lütfen müşteri hizmetleri ile iletişime geçin.');
    }

    const primaryMembership = user.memberships[0];
    const company = primaryMembership?.company;
    const customerGroup = company?.customerGroup;

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: company?.id || null,
      companyName: company?.legalName || null,
      customerGroupId: customerGroup?.id || null,
      customerGroupCode: customerGroup?.code || null,
      memberRole: primaryMembership?.memberRole || null,
    };

    const token = signToken(payload);
    setAuthCookie(token);

    await recordAuditLog({
      actorId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      afterJson: JSON.stringify({ role: user.role, companyId: company?.id }),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        company: company ? {
          id: company.id,
          legalName: company.legalName,
          taxNo: company.taxNo,
          taxOffice: company.taxOffice,
          status: company.status,
          customerGroup: customerGroup ? {
            id: customerGroup.id,
            name: customerGroup.name,
            code: customerGroup.code,
          } : null,
          currentAccount: company.currentAccount ? {
            creditLimit: Number(company.currentAccount.creditLimit),
          } : null,
        } : null,
      },
      token,
    };
  },

  async registerB2C({ email, password, name, phone }: RegisterB2CParams) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new Error('Bu e-posta adresiyle kayıtlı bir hesap zaten var.');
    }

    const passwordHash = await bcrypt.hash(password || 'Ersa123!', 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name,
        phone,
        role: 'B2C_CUSTOMER',
        status: 'ACTIVE',
      }
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: null,
      customerGroupId: null,
    };

    const token = signToken(payload);
    setAuthCookie(token);

    return { user, token };
  },

  async applyB2B(params: ApplyB2BParams) {
    const cleanEmail = params.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
    }

    const defaultGroup = await prisma.customerGroup.findFirst({
      where: { code: 'GROUP_B' } // Varsayılan onaylanan bayi grubu
    });

    const passwordHash = await bcrypt.hash(params.password || 'Ersa123!', 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          legalName: params.legalName,
          taxNo: params.taxNo,
          taxOffice: params.taxOffice,
          phone: params.phone,
          email: cleanEmail,
          status: 'PENDING', // Admin onayı bekleyecek
          customerGroupId: defaultGroup?.id || null,
        }
      });

      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: params.name,
          phone: params.phone,
          role: 'B2B_CUSTOMER',
          status: 'PENDING',
          memberships: {
            create: {
              companyId: company.id,
              memberRole: 'OWNER',
            }
          },
          addresses: {
            create: {
              companyId: company.id,
              title: 'Merkez Adres',
              line1: params.addressLine,
              city: params.city,
              district: params.district,
              isDefault: true,
            }
          }
        }
      });

      // Cari hesap kaydı oluştur (Başlangıç limiti 0, onayda belirlenecek)
      await tx.currentAccount.create({
        data: {
          companyId: company.id,
          creditLimit: 0,
        }
      });

      return { user, company };
    });

    await recordAuditLog({
      actorId: result.user.id,
      action: 'B2B_APPLICATION_SUBMITTED',
      entityType: 'Company',
      entityId: result.company.id,
      afterJson: JSON.stringify({ legalName: params.legalName, taxNo: params.taxNo }),
    });

    return {
      message: 'B2B Bayilik başvurunuz başarıyla alınmıştır. Admin onayından sonra hesabınız aktifleşecektir.',
      companyId: result.company.id,
    };
  },

  async logout() {
    clearAuthCookie();
    return { success: true };
  }
};
