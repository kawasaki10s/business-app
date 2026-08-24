'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-coffee text-cream hover:bg-coffee-dark active:scale-[0.98] disabled:bg-brown/40',
  secondary: 'bg-cream text-coffee-dark border border-border hover:bg-border/40 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink-soft hover:bg-cream active:scale-[0.98]',
  danger: 'bg-danger text-cream hover:brightness-110 active:scale-[0.98] disabled:bg-danger/40',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-150',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
