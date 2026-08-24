import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requirePermission, requireAuth, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { computeLoanLedgerDeltas, InvalidLoanError } from '@/lib/finance/loan';
import { createBroadcastNotification } from '@/lib/notifications';
import { serializeBigInt, formatUZS } from '@/lib/serialize';
import { NotificationType, PaymentMethodType, TransactionType, Role } from '@prisma/client';

const loanSchema = z.object({
  amount: z.number().int().positive(),
  paymentMethodType: z.nativeEnum(PaymentMethodType),
  cardId: z.string().optional(),
  // Admin only: allows creating a loan on behalf of another investor
  onBehalfOfUserId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireAuth();
    const body = loanSchema.parse(await req.json());

    const borrowerId = body.onBehalfOfUserId ?? sessionUser.id;

    // Only admin may create a loan for someone else
    if (body.onBehalfOfUserId && body.onBehalfOfUserId !== sessionUser.id) {
      await requirePermission('CREATE_LOAN_FOR_OTHERS');
    } else {
      await requirePermission('CREATE_OWN_LOAN');
    }

    if (body.paymentMethodType === PaymentMethodType.CARD && !body.cardId) {
      return NextResponse.json({ error: "Karta tanlanishi shart" }, { status: 400 });
    }

    // All 3 investors, in a stable order - required by the loan split logic
    const investors = await prisma.user.findMany({
      where: { role: Role.INVESTOR },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (investors.length !== 3) {
      return NextResponse.json(
        { error: "Tizimda aynan 3 ta investor bo'lishi kerak, sozlamalarni tekshiring" },
        { status: 500 }
      );
    }

    const amount = BigInt(body.amount);
    const allIds = investors.map((i) => i.id);
    const deltas = computeLoanLedgerDeltas(borrowerId, amount, allIds);

    // ------------------------------------------------------------
    // ATOMIC TRANSACTION: Transaction + all LedgerEntries + Balance
    // updates + Notification all commit together, or none do.
    // ------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      if (body.cardId) {
        const card = await tx.card.findUnique({ where: { id: body.cardId } });
        if (!card || card.userId !== borrowerId) {
          throw new InvalidLoanError("Karta topilmadi yoki sizga tegishli emas");
        }
      }

      const txnRecord = await tx.transaction.create({
        data: {
          type: TransactionType.LOAN,
          amount,
          initiatorUserId: sessionUser.id,
          paymentMethodType: body.paymentMethodType,
          cardId: body.cardId ?? null,
        },
      });

      const borrowerName = await tx.user.findUnique({ where: { id: borrowerId }, select: { name: true } });

      for (const d of deltas) {
        const balance = await tx.balance.upsert({
          where: { userId: d.userId },
          create: { userId: d.userId, currentAmount: d.delta },
          update: { currentAmount: { increment: d.delta } },
        });

        await tx.ledgerEntry.create({
          data: {
            transactionId: txnRecord.id,
            userId: d.userId,
            delta: d.delta,
            balanceAfter: balance.currentAmount,
          },
        });
      }

      await createBroadcastNotification(
        tx,
        NotificationType.LOAN,
        `${borrowerName?.name ?? 'Foydalanuvchi'} ${formatUZS(amount)} qarz oldi.`
      );

      return txnRecord;
    });

    return NextResponse.json({ transaction: serializeBigInt(result) }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

function handleApiError(err: unknown) {
  if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
  if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
  if (err instanceof InvalidLoanError) return NextResponse.json({ error: err.message }, { status: 400 });
  if (err instanceof z.ZodError) return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot', details: err.errors }, { status: 400 });
  console.error(err);
  return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
}
