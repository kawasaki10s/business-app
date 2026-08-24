import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, UnauthenticatedError } from '@/lib/permissions';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await prisma.notification.update({ where: { id: params.id }, data: { isRead: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
