import { prisma } from '@/lib/db';
import { formatUZS } from '@/lib/serialize';
import { computeSingleOwnershipValue, formatOwnershipPercent } from '@/lib/finance';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default async function InvestorsPage() {
  const [investors, business] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'INVESTOR' },
      include: { ownership: true, investment: true, balance: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.business.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Investorlar</p>
        <p className="text-sm text-ink-soft">Barcha 3 investorning umumiy ma'lumotlari</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {investors.map((inv) => {
          const value = inv.ownership
            ? computeSingleOwnershipValue(business?.currentValue ?? 0n, inv.ownership.numerator, inv.ownership.denominator)
            : 0n;
          return (
            <Link key={inv.id} href={`/investors/${inv.id}`}>
              <Card className="h-full">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coffee text-sm font-semibold text-cream">
                    {inv.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{inv.name}</p>
                    <p className="text-xs text-ink-soft">
                      {inv.ownership ? formatOwnershipPercent(inv.ownership.numerator, inv.ownership.denominator) : '—'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Ulush qiymati</span>
                    <span className="font-money font-medium text-ink">{formatUZS(value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Schot</span>
                    <span className={`font-money font-medium ${(inv.balance?.currentAmount ?? 0n) < 0n ? 'text-danger' : 'text-ink'}`}>
                      {formatUZS(inv.balance?.currentAmount ?? 0n)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
