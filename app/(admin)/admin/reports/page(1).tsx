'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileSpreadsheet, FileText } from 'lucide-react';

const SECTIONS = [
  { key: 'investors', label: 'Investorlar' },
  { key: 'investments', label: 'Investitsiyalar' },
  { key: 'loans', label: 'Qarzlar' },
  { key: 'balances', label: 'Schotlar' },
  { key: 'history', label: 'Tarix' },
  { key: 'businessValueHistory', label: 'Biznes qiymati tarixi' },
];

export default function AdminReportsPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s.key, true]))
  );
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  async function handleExport(format: 'excel' | 'pdf') {
    setLoading(format);
    const sections = Object.entries(selected).filter(([, v]) => v).map(([k]) => k).join(',');
    const params = new URLSearchParams({ sections });
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const res = await fetch(`/api/reports/${format}?${params.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoading(null);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Hisobotlar</p>
        <p className="text-sm text-ink-soft">Excel yoki PDF formatida export qiling</p>
      </div>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink">Bo'limlar</p>
        <div className="space-y-2.5">
          {SECTIONS.map((s) => (
            <Checkbox
              key={s.key}
              id={s.key}
              checked={selected[s.key] ?? false}
              onChange={(v) => setSelected((prev) => ({ ...prev, [s.key]: v }))}
              label={s.label}
            />
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink">Sana oralig'i</p>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-coffee" />
          <span className="text-ink-soft">—</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-coffee" />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" loading={loading === 'excel'} onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </Button>
        <Button className="flex-1" loading={loading === 'pdf'} onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4" /> PDF
        </Button>
      </div>
    </div>
  );
}
