import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAdmin, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/auditLog';
import { serializeBigInt } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name;
    if (body.email) data.email = body.email.toLowerCase().trim();
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: params.id }, data });
      await recordAuditLog(tx, {
        actorId: admin.id,
        action: 'USER_EDITED',
        entityType: 'User',
        entityId: params.id,
        oldValue: { name: existing.name, email: existing.email, isActive: existing.isActive },
        newValue: { name: updated.name, email: updated.email, isActive: updated.isActive },
      });
      return updated;
    });

    return NextResponse.json({ user: serializeBigInt(result) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: params.id }, data: { isActive: false } });
      await recordAuditLog(tx, {
        actorId: admin.id,
        action: 'USER_DEACTIVATED',
        entityType: 'User',
        entityId: params.id,
        oldValue: { isActive: true },
        newValue: { isActive: false },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
