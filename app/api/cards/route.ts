import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth, canActOnUser, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { encryptCardRef, maskCardNumber } from '@/lib/cardEncryption';
import { serializeBigInt } from '@/lib/serialize';
export const dynamic = 'force-dynamic';

const createCardSchema = z.object({
  cardNumber: z.string().min(12).max(19),
  label: z.string().optional(),
  userId: z.string().optional(), // admin can add a card for another user
});

export async function GET() {
  const sessionUser = await requireAuth();
  const cards = await prisma.card.findMany({
    where: { userId: sessionUser.id },
    select: { id: true, lastFour: true, label: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ cards: serializeBigInt(cards) });
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireAuth();
    const body = createCardSchema.parse(await req.json());
    const targetUserId = body.userId ?? sessionUser.id;

    if (!canActOnUser(sessionUser, targetUserId)) {
      throw new UnauthorizedError("Boshqa foydalanuvchiga karta qo'sha olmaysiz");
    }

    const card = await prisma.card.create({
      data: {
        userId: targetUserId,
        lastFour: maskCardNumber(body.cardNumber),
        encryptedRef: encryptCardRef(body.cardNumber),
        label: body.label,
      },
      select: { id: true, lastFour: true, label: true, createdAt: true },
    });

    return NextResponse.json({ card: serializeBigInt(card) }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
