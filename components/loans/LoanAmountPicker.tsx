'use client';

import clsx from 'clsx';
import { formatUZS } from '@/lib/serialize';

const PRESET_AMOUNTS = [10_000, 20_000, 30_000, 50_000, 100_000, 200_000];

interface Props {
  value: number | null;
  onChange: (amount: number) => void;
}

export function LoanAmountPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PRESET_AMOUNTS.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onChange(amount)}
          className={clsx(
            'rounded-xl border-2 py-3.5 text-center font-money text-sm font-semibold transition-all',
            value === amount
              ? 'border-coffee bg-coffee text-cream shadow-soft'
              : 'border-border bg-white text-ink hover:border-brown hover:bg-cream/50'
          )}
        >
          -{formatUZS(amount)}
        </button>
      ))}
    </div>
  );
}
