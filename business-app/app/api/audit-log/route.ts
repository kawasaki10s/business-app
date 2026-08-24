import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { serializeBigInt } from '@/lib/serialize';

export async function GET() {
  try {
    await requirePermission('VIEW_AUDIT_LOG');
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true } } },
      take: 300,
    });
    return NextResponse.json({ logs: serializeBigInt(logs) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
