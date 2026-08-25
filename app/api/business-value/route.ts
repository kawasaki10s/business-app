import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/auditLog';
import { createBroadcastNotification } from '@/lib/notifications';
import { serializeBigInt, formatUZS } from '@/lib/serialize';
import { NotificationType } from '@prisma/client';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  newValue: z.number().int().positive(),
});

export async function GET() {
  const business = await prisma.business.findFirst({
    include: { valueHistory: { orderBy: { createdAt: 'asc' } } },
  });
  return NextResponse.json({ business: serializeBigInt(business) });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requirePermission('EDIT_BUSINESS_VALUE');
    const body = updateSchema.parse(await req.json());
    const newValue = BigInt(body.newValue);

    const business = await prisma.business.findFirst();
    if (!business) {
      return NextResponse.json({ error: 'Biznes topilmadi' }, { status: 404 });
    }
    const oldValue = business.currentValue;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.business.update({
        where: { id: business.id },
        data: { currentValue: newValue },
      });

      await tx.businessValueHistory.create({
        data: { businessId: business.id, value: newValue, changedById: admin.id },
      });

      await recordAuditLog(tx, {
        actorId: admin.id,
        action: 'BUSINESS_VALUE_CHANGED',
        entityType: 'Business',
        entityId: business.id,
        oldValue: oldValue.toString(),
        newValue: newValue.toString(),
      });

      await createBroadcastNotification(
        tx,
        NotificationType.BUSINESS_VALUE_CHANGED,
        `Biznes qiymati yangilandi: ${formatUZS(oldValue)} → ${formatUZS(newValue)}`
      );

      return updated;
    });

    return NextResponse.json({ business: serializeBigInt(result) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
