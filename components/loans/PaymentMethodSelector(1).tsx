'use client';

import clsx from 'clsx';
import { CreditCard, Banknote } from 'lucide-react';

type Method = 'CARD' | 'CASH';

interface Props {
  value: Method | null;
  onChange: (m: Method) => void;
  cards: { id: string; lastFour: string; label?: string | null }[];
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
}

export function PaymentMethodSelector({ value, onChange, cards, selectedCardId, onSelectCard }: Props) {
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('CARD')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors',
            value === 'CARD' ? 'border-coffee bg-coffee text-cream' : 'border-border bg-white text-ink-soft hover:bg-cream'
          )}
        >
          <CreditCard className="h-4 w-4" /> Karta
        </button>
        <button
          type="button"
          onClick={() => onChange('CASH')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors',
            value === 'CASH' ? 'border-coffee bg-coffee text-cream' : 'border-border bg-white text-ink-soft hover:bg-cream'
          )}
        >
          <Banknote className="h-4 w-4" /> Naqd
        </button>
      </div>

      {value === 'CARD' && (
        <div className="space-y-2 animate-slideUp">
          {cards.length === 0 && <p className="text-xs text-ink-soft">Sizda hali karta yo'q. Avval Kartalar bo'limidan qo'shing.</p>}
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCard(c.id)}
              className={clsx(
                'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors',
                selectedCardId === c.id ? 'border-coffee bg-cream' : 'border-border bg-white hover:bg-cream/60'
              )}
            >
              <span className="font-money text-ink">**** {c.lastFour}</span>
              {c.label && <span className="text-xs text-ink-soft">{c.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
