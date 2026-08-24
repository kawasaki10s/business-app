import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Creates a broadcast notification (visible to everyone) within an existing
 * Prisma transaction, so it commits atomically with the triggering action.
 */
export async function createBroadcastNotification(
  tx: Prisma.TransactionClient,
  type: NotificationType,
  message: string
) {
  return tx.notification.create({
    data: { userId: null, type, message },
  });
}
