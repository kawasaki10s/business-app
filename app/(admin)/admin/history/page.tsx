import { prisma } from '@/lib/db';
import { formatUZS } from '@/lib/serialize';
import { Card } from '@/components/ui/Card';
import { CreditCard, Banknote } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { initiator: true, card: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Umumiy tarix</p>
        <p className="text-sm text-ink-soft">Barcha investorlar uchun bir xil global tarix</p>
      </div>

      <Card>
        <div className="divide-y divide-border/60">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-coffee">
                  {t.paymentMethodType === 'CARD' ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    {t.initiator.name} {t.type === 'LOAN' ? 'qarz oldi' : "schotdan foydalandi"}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {new Date(t.createdAt).toLocaleString('uz-UZ')}
                    {t.card && ` • **** ${t.card.lastFour}`}
                    {t.paymentMethodType === 'CASH' && ' • Naqd'}
                  </p>
                </div>
              </div>
              <p className="font-money text-sm font-semibold text-danger">-{formatUZS(t.amount)}</p>
            </div>
          ))}
          {transactions.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">Hozircha tarix yo'q</p>}
        </div>
      </Card>
    </div>
  );
}
