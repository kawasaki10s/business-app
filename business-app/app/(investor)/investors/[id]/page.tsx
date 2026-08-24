import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatUZS } from '@/lib/serialize';
import { computeSingleOwnershipValue, formatOwnershipPercent } from '@/lib/finance';
import { Card, CardLabel, CardValue } from '@/components/ui/Card';

export default async function InvestorProfilePage({ params }: { params: { id: string } }) {
  const [investor, business, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: { ownership: true, investment: true, balance: true, cards: true },
    }),
    prisma.business.findFirst(),
    prisma.transaction.findMany({
      where: { ledgerEntries: { some: { userId: params.id } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { ledgerEntries: { where: { userId: params.id } } },
    }),
  ]);

  if (!investor || investor.role !== 'INVESTOR') notFound();

  const ownershipValue = investor.ownership
    ? computeSingleOwnershipValue(business?.currentValue ?? 0n, investor.ownership.numerator, investor.ownership.denominator)
    : 0n;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coffee text-xl font-semibold text-cream">
          {investor.name[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display text-2xl italic text-coffee-dark">{investor.name}</p>
          <p className="text-sm text-ink-soft">{investor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardLabel>Boshlang'ich investitsiya</CardLabel>
          <CardValue>{formatUZS(investor.investment?.initialAmount ?? 0n)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Ulush</CardLabel>
          <CardValue>{investor.ownership ? formatOwnershipPercent(investor.ownership.numerator, investor.ownership.denominator) : '—'}</CardValue>
        </Card>
        <Card>
          <CardLabel>Hozirgi ulush qiymati</CardLabel>
          <CardValue>{formatUZS(ownershipValue)}</CardValue>
        </Card>
        <Card>
          <CardLabel>Schot</CardLabel>
          <CardValue className={(investor.balance?.currentAmount ?? 0n) < 0n ? 'text-danger' : ''}>
            {formatUZS(investor.balance?.currentAmount ?? 0n)}
          </CardValue>
        </Card>
      </div>

      <Card>
        <p className="mb-3 font-display text-base italic text-coffee-dark">Kartalar</p>
        <div className="flex flex-wrap gap-2">
          {investor.cards.map((c) => (
            <span key={c.id} className="font-money rounded-lg bg-cream px-3 py-1.5 text-sm text-ink">**** {c.lastFour}</span>
          ))}
          {investor.cards.length === 0 && <p className="text-sm text-ink-soft">Karta qo'shilmagan</p>}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-base italic text-coffee-dark">Qarz / schot tarixi</p>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b border-border/60 pb-2.5 last:border-0">
              <div>
                <p className="text-sm text-ink">{t.type === 'LOAN' ? 'Qarz oldi' : "Schotdan foydalandi"}</p>
                <p className="text-xs text-ink-soft">{new Date(t.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
              <p className={`font-money text-sm font-medium ${t.ledgerEntries[0]!.delta < 0n ? 'text-danger' : 'text-success'}`}>
                {t.ledgerEntries[0]!.delta > 0n ? '+' : ''}{formatUZS(t.ledgerEntries[0]!.delta)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-sm text-ink-soft">Tarix yo'q</p>}
        </div>
      </Card>
    </div>
  );
}
