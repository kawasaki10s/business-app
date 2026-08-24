'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, Plus } from 'lucide-react';

export default function CardsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => (await fetch('/api/cards')).json(),
  });
  const cards = data?.cards ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: cardNumber.replace(/\s/g, ''), label: label || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Xatolik');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setCardNumber('');
      setLabel('');
      setShowForm(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl italic text-coffee-dark">Kartalarim</p>
          <p className="text-sm text-ink-soft">Faqat oxirgi 4 raqam ko'rsatiladi</p>
        </div>
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Qo'shish
        </Button>
      </div>

      {showForm && (
        <Card className="animate-slideUp">
          <div className="space-y-3">
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
            />
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nomi (ixtiyoriy)"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coffee"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button className="w-full" loading={mutation.isPending} onClick={() => { setError(null); mutation.mutate(); }}>
              Saqlash
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {cards.map((c: any) => (
          <Card key={c.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee text-cream">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-money font-medium text-ink">**** {c.lastFour}</p>
              {c.label && <p className="text-xs text-ink-soft">{c.label}</p>}
            </div>
          </Card>
        ))}
        {cards.length === 0 && !showForm && <p className="text-sm text-ink-soft">Hali karta qo'shilmagan</p>}
      </div>
    </div>
  );
}
