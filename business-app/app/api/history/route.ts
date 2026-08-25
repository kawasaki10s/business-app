import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { serializeBigInt } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// ------------------------------------------------------------
// GLOBAL HISTORY: identical for all 3 investors + admin.
// This intentionally does NOT filter by requesting user - the
// spec requires one shared feed, not per-user history.
// ------------------------------------------------------------

export async function GET() {
  try {
    await requirePermission('VIEW_GLOBAL_HISTORY');

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        initiator: { select: { id: true, name: true } },
        card: { select: { lastFour: true } },
        ledgerEntries: { include: { user: { select: { id: true, name: true } } } },
      },
      take: 200,
    });

    return NextResponse.json({ history: serializeBigInt(transactions) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
