import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/permissions';
import { formatUZS } from '@/lib/serialize';
import { computeGrowthPercent, computeSingleOwnershipValue, formatGrowthPercent, formatOwnershipPercent } from '@/lib/finance';
import { Card, CardLabel, CardValue } from '@/components/ui/Card';
import { BusinessGrowthChart } from '@/components/charts/BusinessGrowthChart';
import { Briefcase, Wallet, PiggyBank } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await requireAuth();

  const [business, investors, myBalance, myOwnership, recentHistory] = await Promise.all([
    prisma.business.findFirst({ include: { valueHistory: { orderBy: { createdAt: 'asc' } } } }),
    prisma.user.findMany({ where: { role: 'INVESTOR' }, include: { ownership: true }, orderBy: { createdAt: 'asc' } }),
    prisma.balance.findUnique({ where: { userId: user.id } }),
    prisma.ownership.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { initiator: true } }),
  ]);

  const currentValue = business?.currentValue ?? 0n;
  const initialValue = business?.valueHistory[0]?.value ?? currentValue;
  const growth = computeGrowthPercent(initialValue, currentValue);
  const myOwnershipValue = myOwnership
    ? computeSingleOwnershipValue(currentValue, myOwnership.numerator, myOwnership.denominator)
    : 0n;

  const chartHistory = (business?.valueHistory ?? []).map((h) => ({ date: h.createdAt.toISOString(), value: h.value }));
  const investorOptions = investors
    .filter((i) => i.ownership)
    .map((i) => ({ id: i.id, name: i.name, numerator: i.ownership!.numerator, denominator: i.ownership!.denominator }));

  return (
    <div className="space-y-6">
      <BusinessGrowthChart history={chartHistory} investors={investorOptions} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <CardLabel>Biznes qiymati</CardLabel>
            <Briefcase className="h-4 w-4 text-brown" />
          </div>
          <CardValue>{formatUZS(currentValue)}</CardValue>
          <p className={`mt-1 text-xs font-medium ${growth >= 0 ? 'text-success' : 'text-danger'}`}>{formatGrowthPercent(growth)}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardLabel>Sizning ulushingiz</CardLabel>
            <Wallet className="h-4 w-4 text-brown" />
          </div>
          <CardValue>{formatUZS(myOwnershipValue)}</CardValue>
          <p className="mt-1 text-xs font-medium text-ink-soft">
            {myOwnership ? formatOwnershipPercent(myOwnership.numerator, myOwnership.denominator) : '—'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardLabel>Schot</CardLabel>
            <PiggyBank className="h-4 w-4 text-brown" />
          </div>
          <CardValue className={myBalance && myBalance.currentAmount < 0n ? 'text-danger' : ''}>
            {formatUZS(myBalance?.currentAmount ?? 0n)}
          </CardValue>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base italic text-coffee-dark">Investorlar</p>
            <Link href="/investors" className="text-xs font-medium text-coffee hover:underline">Barchasi</Link>
          </div>
          <div className="space-y-3">
            {investors.map((inv) => (
              <Link key={inv.id} href={`/investors/${inv.id}`} className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-cream">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coffee text-xs font-semibold text-cream">
                    {inv.name[0]?.toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-ink">{inv.name}</p>
                </div>
                <p className="font-money text-xs text-ink-soft">
                  {inv.ownership ? formatOwnershipPercent(inv.ownership.numerator, inv.ownership.denominator) : '—'}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base italic text-coffee-dark">Oxirgi tarix</p>
            <Link href="/history" className="text-xs font-medium text-coffee hover:underline">Barchasi</Link>
          </div>
          <div className="space-y-3">
            {recentHistory.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-ink">{h.initiator.name} {h.type === 'LOAN' ? 'qarz oldi' : 'schotdan foydalandi'}</p>
                  <p className="text-xs text-ink-soft">{new Date(h.createdAt).toLocaleDateString('uz-UZ')}</p>
                </div>
                <p className="font-money text-sm font-medium text-danger">-{formatUZS(h.amount)}</p>
              </div>
            ))}
            {recentHistory.length === 0 && <p className="text-sm text-ink-soft">Hozircha tarix yo'q</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
