import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/permissions';
import { formatUZS } from '@/lib/serialize';
import { computeSingleOwnershipValue, formatOwnershipPercent } from '@/lib/finance';
import { Card, CardLabel, CardValue } from '@/components/ui/Card';

export default async function InvestmentsPage() {
  const user = await requireAuth();

  const [investors, business] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'INVESTOR' },
      include: { ownership: true, investment: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.business.findFirst(),
  ]);

  const totalInvestment = investors.reduce((acc, i) => acc + (i.investment?.initialAmount ?? 0n), 0n);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Investitsiyalar</p>
        <p className="text-sm text-ink-soft">Boshlang'ich investitsiya, ulush va joriy qiymat — bular alohida tushunchalar</p>
      </div>

      <Card>
        <CardLabel>Jami investitsiya</CardLabel>
        <CardValue>{formatUZS(totalInvestment)}</CardValue>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white/60 shadow-soft">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/60 text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Investor</th>
              <th className="px-4 py-3 font-medium">Boshlang'ich investitsiya</th>
              <th className="px-4 py-3 font-medium">Ulush</th>
              <th className="px-4 py-3 font-medium">Hozirgi ulush qiymati</th>
              <th className="px-4 py-3 font-medium">O'sish</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv) => {
              const currentValue = inv.ownership
                ? computeSingleOwnershipValue(business?.currentValue ?? 0n, inv.ownership.numerator, inv.ownership.denominator)
                : 0n;
              const initial = inv.investment?.initialAmount ?? 0n;
              const diff = currentValue - initial;
              return (
                <tr key={inv.id} className={`border-b border-border/60 last:border-0 ${inv.id === user.id ? 'bg-cream/40' : ''}`}>
                  <td className="px-4 py-3 font-medium text-ink">{inv.name}</td>
                  <td className="font-money px-4 py-3 text-ink">{formatUZS(initial)}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {inv.ownership ? formatOwnershipPercent(inv.ownership.numerator, inv.ownership.denominator) : '—'}
                  </td>
                  <td className="font-money px-4 py-3 font-medium text-ink">{formatUZS(currentValue)}</td>
                  <td className={`font-money px-4 py-3 font-medium ${diff >= 0n ? 'text-success' : 'text-danger'}`}>
                    {diff >= 0n ? '+' : ''}{formatUZS(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
