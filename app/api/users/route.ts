import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAdmin, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/auditLog';
import { serializeBigInt } from '@/lib/serialize';
import { Role } from '@prisma/client';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true, createdAt: true,
        ownership: true, investment: true, balance: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ users: serializeBigInt(users) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = createUserSchema.parse(await req.json());

    const passwordHash = await bcrypt.hash(body.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: body.name,
          email: body.email.toLowerCase().trim(),
          passwordHash,
          role: body.role,
        },
      });

      if (body.role === Role.INVESTOR) {
        await tx.balance.create({ data: { userId: user.id, currentAmount: 0n } });
      }

      await recordAuditLog(tx, {
        actorId: admin.id,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        newValue: { name: user.name, email: user.email, role: user.role },
      });

      return user;
    });

    return NextResponse.json({ user: serializeBigInt(result) }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot", details: err.errors }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
