'use client';

import { Check } from 'lucide-react';
import clsx from 'clsx';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export function Checkbox({ checked, onChange, label, id = 'checkbox' }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 select-none">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
          checked ? 'border-coffee bg-coffee' : 'border-border bg-white'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-cream" strokeWidth={3} />}
      </button>
      <span className="text-sm text-ink-soft">{label}</span>
    </label>
  );
}
