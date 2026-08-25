import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { computeBalanceSpendingDelta, InvalidSpendingError } from '@/lib/finance/balanceSpending';
import { createBroadcastNotification } from '@/lib/notifications';
import { serializeBigInt, formatUZS } from '@/lib/serialize';
import { NotificationType, TransactionType } from '@prisma/client';
export const dynamic = 'force-dynamic';

const spendSchema = z.object({
  amount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireAuth();
    const body = spendSchema.parse(await req.json());
    const amount = BigInt(body.amount);

    const result = await prisma.$transaction(async (tx) => {
      const balance = await tx.balance.upsert({
        where: { userId: sessionUser.id },
        create: { userId: sessionUser.id, currentAmount: 0n },
        update: {},
      });

      // Re-check inside the transaction to avoid a race between read and write
      const deltas = computeBalanceSpendingDelta(sessionUser.id, amount, balance.currentAmount);

      const txnRecord = await tx.transaction.create({
        data: {
          type: TransactionType.BALANCE_SPENDING,
          amount,
          initiatorUserId: sessionUser.id,
        },
      });

      const updatedBalance = await tx.balance.update({
        where: { userId: sessionUser.id },
        data: { currentAmount: { increment: deltas[0]!.delta } },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: txnRecord.id,
          userId: sessionUser.id,
          delta: deltas[0]!.delta,
          balanceAfter: updatedBalance.currentAmount,
        },
      });

      await createBroadcastNotification(
        tx,
        NotificationType.BALANCE_SPENDING,
        `${sessionUser.name ?? 'Foydalanuvchi'} schotidan ${formatUZS(amount)} foydalandi.`
      );

      return txnRecord;
    });

    return NextResponse.json({ transaction: serializeBigInt(result) }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof InvalidSpendingError) return NextResponse.json({ error: err.message }, { status: 400 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
