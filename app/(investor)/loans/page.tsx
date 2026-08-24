'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { LoanAmountPicker } from '@/components/loans/LoanAmountPicker';
import { PaymentMethodSelector } from '@/components/loans/PaymentMethodSelector';
import { ConfirmationReceipt } from '@/components/loans/ConfirmationReceipt';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Method = 'CARD' | 'CASH';

export default function LoansPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastResult, setLastResult] = useState<{ amount: number; method: Method; lastFour?: string; createdAt: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: cardsData } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => (await fetch('/api/cards')).json(),
  });
  const cards = cardsData?.cards ?? [];

  const canSubmit = amount !== null && method !== null && (method === 'CASH' || cardId !== null) && accepted;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethodType: method, cardId: method === 'CARD' ? cardId : undefined }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Xatolik yuz berdi");
      }
      return res.json();
    },
    onSuccess: () => {
      const card = cards.find((c: any) => c.id === cardId);
      setLastResult({ amount: amount!, method: method!, lastFour: card?.lastFour, createdAt: new Date() });
      setReceiptOpen(true);
      setAmount(null);
      setMethod(null);
      setCardId(null);
      setAccepted(false);
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="font-display text-2xl italic text-coffee-dark">Qarz olish</p>
        <p className="text-sm text-ink-soft">Summani tanlang va tasdiqlang</p>
      </div>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink">To'lov usuli</p>
        <PaymentMethodSelector
          value={method}
          onChange={(m) => { setMethod(m); setCardId(null); }}
          cards={cards}
          selectedCardId={cardId}
          onSelectCard={setCardId}
        />
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink">Summa</p>
        <LoanAmountPicker value={amount} onChange={setAmount} />
      </Card>

      <Card>
        <Checkbox
          checked={accepted}
          onChange={setAccepted}
          label="Xavfsizlik va maxfiylik shartlarini qabul qilaman"
        />
      </Card>

      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Button
        className="w-full"
        disabled={!canSubmit}
        loading={mutation.isPending}
        onClick={() => { setError(null); mutation.mutate(); }}
      >
        TASDIQLASH
      </Button>

      {lastResult && (
        <ConfirmationReceipt
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          amount={lastResult.amount}
          method={lastResult.method}
          lastFour={lastResult.lastFour}
          userName={session?.user?.name ?? ''}
          createdAt={lastResult.createdAt}
        />
      )}
    </div>
  );
}
