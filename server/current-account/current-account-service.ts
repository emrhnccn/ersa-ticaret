import { prisma } from '../db';
import { recordAuditLog } from '../audit/audit-service';

export interface RecordTransactionParams {
  companyId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  orderId?: string | null;
  paymentId?: string | null;
  note?: string;
  actorId?: string | null;
}

export const currentAccountService = {
  async getAccount(companyId: string) {
    let account = await prisma.currentAccount.findUnique({
      where: { companyId },
      include: {
        company: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            order: { select: { orderNo: true } },
            payment: { select: { providerRef: true, purpose: true } },
          }
        }
      }
    });

    if (!account) {
      account = await prisma.currentAccount.create({
        data: { companyId, creditLimit: 0 },
        include: {
          company: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              order: { select: { orderNo: true } },
              payment: { select: { providerRef: true, purpose: true } },
            }
          }
        }
      });
    }

    // Bakiye hesapla (Toplam Borç: DEBIT - CREDIT)
    const txAgg = await prisma.currentAccountTransaction.groupBy({
      by: ['type'],
      where: { accountId: account.id },
      _sum: { amount: true },
    });

    let totalDebit = 0;
    let totalCredit = 0;

    for (const group of txAgg) {
      const sum = Number(group._sum.amount || 0);
      if (group.type === 'DEBIT') totalDebit = sum;
      if (group.type === 'CREDIT') totalCredit = sum;
    }

    const currentBalance = Number((totalDebit - totalCredit).toFixed(2)); // Pozitif = Müşterinin bize borcu
    const creditLimit = Number(account.creditLimit);
    const availableLimit = Number((creditLimit - currentBalance).toFixed(2));

    return {
      id: account.id,
      companyId: account.companyId,
      companyName: account.company.legalName,
      creditLimit,
      currentBalance,
      availableLimit,
      canUseCredit: availableLimit > 0,
      transactions: account.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        note: t.note,
        orderNo: t.order?.orderNo || null,
        paymentRef: t.payment?.providerRef || null,
        createdAt: t.createdAt,
      })),
    };
  },

  async recordTransaction(params: RecordTransactionParams) {
    const summary = await this.getAccount(params.companyId);
    const amt = Number(params.amount.toFixed(2));
    
    let newBalance = summary.currentBalance;
    if (params.type === 'DEBIT') {
      newBalance += amt;
    } else {
      newBalance -= amt;
    }
    newBalance = Number(newBalance.toFixed(2));

    const tx = await prisma.currentAccountTransaction.create({
      data: {
        accountId: summary.id,
        type: params.type,
        amount: amt,
        balanceAfter: newBalance,
        orderId: params.orderId || null,
        paymentId: params.paymentId || null,
        note: params.note || (params.type === 'DEBIT' ? 'Sipariş Borcu' : 'Tahsilat / Ödeme'),
      }
    });

    await recordAuditLog({
      actorId: params.actorId,
      action: `CURRENT_ACCOUNT_${params.type}`,
      entityType: 'CurrentAccount',
      entityId: summary.id,
      afterJson: JSON.stringify({ amount: amt, newBalance, type: params.type }),
    });

    return tx;
  },

  async updateCreditLimit(companyId: string, newLimit: number, actorId?: string) {
    const account = await prisma.currentAccount.upsert({
      where: { companyId },
      update: { creditLimit: newLimit },
      create: { companyId, creditLimit: newLimit },
    });

    await recordAuditLog({
      actorId,
      action: 'UPDATE_CREDIT_LIMIT',
      entityType: 'CurrentAccount',
      entityId: account.id,
      afterJson: JSON.stringify({ newLimit }),
    });

    return account;
  }
};
