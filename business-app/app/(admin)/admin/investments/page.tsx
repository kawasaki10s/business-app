import { prisma } from '@/lib/db';
import { formatUZS } from '@/lib/serialize';
import { computeSingleOwnershipValue, formatOwnershipPercent } from '@/lib/finance';

export default async function AdminInvestmentsPage() {
  const [investors, business] = await Promise.all([
    prisma.user.findMany({ where: { role: 'INVESTOR' }, include: { ownership: true, investment: true }, orderBy: { createdAt: 'asc' } }),
    prisma.business.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Investitsiyalar</p>
        <p className="text-sm text-ink-soft">Barcha investorlarning investitsiya va ulush ma'lumotlari</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white/60 shadow-soft">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/60 text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Investor</th>
              <th className="px-4 py-3 font-medium">Boshlang'ich investitsiya</th>
              <th className="px-4 py-3 font-medium">Ulush (fraction)</th>
              <th className="px-4 py-3 font-medium">Hozirgi qiymat</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv) => (
              <tr key={inv.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{inv.name}</td>
                <td className="font-money px-4 py-3 text-ink">{formatUZS(inv.investment?.initialAmount ?? 0n)}</td>
                <td className="font-money px-4 py-3 text-ink-soft">
                  {inv.ownership ? `${inv.ownership.numerator}/${inv.ownership.denominator} (${formatOwnershipPercent(inv.ownership.numerator, inv.ownership.denominator)})` : '—'}
                </td>
                <td className="font-money px-4 py-3 font-medium text-ink">
                  {inv.ownership ? formatUZS(computeSingleOwnershipValue(business?.currentValue ?? 0n, inv.ownership.numerator, inv.ownership.denominator)) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
