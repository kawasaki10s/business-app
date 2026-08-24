import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-white/60 p-5 shadow-soft backdrop-blur-sm',
        'transition-shadow duration-200 hover:shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{children}</p>;
}

export function CardValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={clsx('font-money mt-1 text-2xl font-semibold text-ink', className)}>{children}</p>;
}
