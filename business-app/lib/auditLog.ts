import type { Prisma } from '@prisma/client';

/**
 * Records an audit log entry within an existing Prisma transaction so it
 * commits atomically with the action it documents. Audit Log is for
 * "who changed what in the system" - distinct from the business History feed.
 */
export async function recordAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
  }
) {
  return tx.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue === undefined ? undefined : (params.oldValue as any),
      newValue: params.newValue === undefined ? undefined : (params.newValue as any),
    },
  });
}
