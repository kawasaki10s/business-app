import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
export const dynamic = 'force-dynamic';

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { actor: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Audit Log</p>
        <p className="text-sm text-ink-soft">Tizimda kim nimani o'zgartirgani — global history'dan alohida</p>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{log.actor.name} — {log.action}</p>
                <p className="text-xs text-ink-soft">{new Date(log.createdAt).toLocaleString('uz-UZ')} • {log.entityType} #{log.entityId.slice(0, 8)}</p>
              </div>
            </div>
            {(log.oldValue || log.newValue) && (
              <div className="mt-2.5 grid grid-cols-2 gap-3 rounded-lg bg-cream/60 p-3 text-xs">
                <div>
                  <p className="mb-1 font-medium text-ink-soft">Eski</p>
                  <pre className="font-money whitespace-pre-wrap break-all text-ink">{JSON.stringify(log.oldValue, null, 2) ?? '—'}</pre>
                </div>
                <div>
                  <p className="mb-1 font-medium text-ink-soft">Yangi</p>
                  <pre className="font-money whitespace-pre-wrap break-all text-ink">{JSON.stringify(log.newValue, null, 2) ?? '—'}</pre>
                </div>
              </div>
            )}
          </Card>
        ))}
        {logs.length === 0 && <p className="text-sm text-ink-soft">Audit log bo'sh</p>}
      </div>
    </div>
  );
}


