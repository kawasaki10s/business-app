import { prisma } from '@/lib/db';
import { formatUZS } from '@/lib/serialize';
import { Card } from '@/components/ui/Card';

// Admin can view all loan transactions here. Editing a transaction amount is
// intentionally routed through a dedicated, audited server action (not shown
// as inline table editing) because loan edits MUST be logged to AuditLog with
// old/new values per the spec (section 21) - never a silent update.

export default async function AdminLoansPage() {
  const loans = await prisma.transaction.findMany({
    where: { type: 'LOAN' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { initiator: true, card: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Qarzlar</p>
        <p className="text-sm text-ink-soft">Barcha qarz tranzaksiyalari — har bir tahrirlash Audit Log'ga yoziladi</p>
      </div>

      <Card>
        <div className="divide-y divide-border/60">
          {loans.map((l) => (
            <div key={l.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">{l.initiator.name}</p>
                <p className="text-xs text-ink-soft">
                  {new Date(l.createdAt).toLocaleString('uz-UZ')}
                  {l.card && ` • **** ${l.card.lastFour}`}
                  {l.paymentMethodType === 'CASH' && ' • Naqd'}
                </p>
              </div>
              <p className="font-money text-sm font-semibold text-danger">-{formatUZS(l.amount)}</p>
            </div>
          ))}
          {loans.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">Qarz tranzaksiyalari yo'q</p>}
        </div>
      </Card>
    </div>
  );
}
