import { prisma } from '@/lib/db';
import { formatUZS } from '@/lib/serialize';
import { computeGrowthPercent, formatGrowthPercent } from '@/lib/finance';
import { Card, CardLabel, CardValue } from '@/components/ui/Card';
import { Briefcase, Users, Banknote, Bell } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [business, investors, recentTxns, unreadNotifs] = await Promise.all([
    prisma.business.findFirst({ include: { valueHistory: { orderBy: { createdAt: 'asc' } } } }),
    prisma.user.count({ where: { role: 'INVESTOR' } }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { initiator: true } }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  const currentValue = business?.currentValue ?? 0n;
  const initialValue = business?.valueHistory[0]?.value ?? currentValue;
  const growth = computeGrowthPercent(initialValue, currentValue);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Admin Dashboard</p>
        <p className="text-sm text-ink-soft">Tizimning umumiy holati</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between"><CardLabel>Biznes qiymati</CardLabel><Briefcase className="h-4 w-4 text-brown" /></div>
          <CardValue>{formatUZS(currentValue)}</CardValue>
          <p className={`mt-1 text-xs font-medium ${growth >= 0 ? 'text-success' : 'text-danger'}`}>{formatGrowthPercent(growth)}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><CardLabel>Investorlar</CardLabel><Users className="h-4 w-4 text-brown" /></div>
          <CardValue>{investors}</CardValue>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><CardLabel>Oxirgi tranzaksiyalar</CardLabel><Banknote className="h-4 w-4 text-brown" /></div>
          <CardValue>{recentTxns.length}</CardValue>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><CardLabel>O'qilmagan bildirishnoma</CardLabel><Bell className="h-4 w-4 text-brown" /></div>
          <CardValue>{unreadNotifs}</CardValue>
        </Card>
      </div>

      <Card>
        <p className="mb-3 font-display text-base italic text-coffee-dark">So'nggi faoliyat</p>
        <div className="divide-y divide-border/60">
          {recentTxns.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <p className="text-sm text-ink">{t.initiator.name} — {t.type === 'LOAN' ? 'qarz' : 'schotdan foydalanish'}</p>
              <p className="font-money text-sm font-medium text-danger">-{formatUZS(t.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
