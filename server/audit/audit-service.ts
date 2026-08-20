import { prisma } from '../db';

export type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  beforeJson?: string | null;
  afterJson?: string | null;
};

export async function writeAuditLog(input: AuditInput) {
  try {
    let validActorId: string | null = null;
    if (input.actorId) {
      const userExists = await prisma.user.findUnique({
        where: { id: input.actorId },
        select: { id: true },
      });
      if (userExists) validActorId = userExists.id;
    }

    await prisma.auditLog.create({
      data: {
        actorId: validActorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: input.beforeJson ?? (input.before ? JSON.stringify(input.before) : null),
        afterJson: input.afterJson ?? (input.after ? JSON.stringify(input.after) : null),
      },
    });
  } catch (error) {
    console.error('Audit log write error:', error);
  }
}

export const recordAuditLog = writeAuditLog;
