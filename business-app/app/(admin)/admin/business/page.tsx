'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardLabel, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatUZS } from '@/lib/serialize';
import { BusinessGrowthChart } from '@/components/charts/BusinessGrowthChart';

export default function AdminBusinessPage() {
  const queryClient = useQueryClient();
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['business-value'],
    queryFn: async () => (await fetch('/api/business-value')).json(),
  });
  const business = data?.business;

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await fetch('/api/users')).json(),
  });
  const investors = (usersData?.users ?? []).filter((u: any) => u.role === 'INVESTOR' && u.ownership);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/business-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newValue: Number(newValue) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-value'] });
      setNewValue('');
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Biznes qiymati</p>
        <p className="text-sm text-ink-soft">Har bir o'zgarish history'da saqlanadi</p>
      </div>

      {business && (
        <BusinessGrowthChart
          history={(business.valueHistory ?? []).map((h: any) => ({ date: h.createdAt, value: h.value }))}
          investors={investors.map((i: any) => ({ id: i.id, name: i.name, numerator: i.ownership.numerator, denominator: i.ownership.denominator }))}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardLabel>Joriy qiymat</CardLabel>
          <CardValue>{business ? formatUZS(business.currentValue) : '—'}</CardValue>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-ink">Yangi qiymat kiriting</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="600000"
              className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
            />
            <Button onClick={() => { setError(null); mutation.mutate(); }} loading={mutation.isPending} disabled={!newValue}>
              Yangilash
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
