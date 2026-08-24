import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { serializeBigInt } from '@/lib/serialize';
import { NotificationType } from '@prisma/client';

export async function GET() {
  try {
    const user = await requireAuth();
    // Each user sees notifications addressed to them OR broadcast (userId = null)
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ notifications: serializeBigInt(notifications) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

const sendSchema = z.object({
  message: z.string().min(1),
  userId: z.string().optional(), // omit = broadcast to everyone
});

export async function POST(req: NextRequest) {
  try {
    await requirePermission('SEND_NOTIFICATION');
    const body = sendSchema.parse(await req.json());
    const notification = await prisma.notification.create({
      data: { userId: body.userId ?? null, type: NotificationType.SYSTEM, message: body.message },
    });
    return NextResponse.json({ notification: serializeBigInt(notification) }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
