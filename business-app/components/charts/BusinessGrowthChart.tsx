'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import clsx from 'clsx';
import { formatUZS } from '@/lib/serialize';
import { computeGrowthPercent, computeSingleOwnershipValue } from '@/lib/finance';

type HistoryPoint = { date: string; value: string | number | bigint };
type Investor = { id: string; name: string; numerator: number; denominator: number };

interface Props {
  history: HistoryPoint[];
  investors: Investor[];
}

export function BusinessGrowthChart({ history, investors }: Props) {
  const [selectedInvestorId, setSelectedInvestorId] = useState(investors[0]?.id);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const initialValue = history[0] ? BigInt(history[0].value) : 0n;

  const chartData = useMemo(
    () =>
      history.map((h) => {
        const value = BigInt(h.value);
        return {
          date: h.date,
          value: Number(value),
          growth: computeGrowthPercent(initialValue, value),
        };
      }),
    [history, initialValue]
  );

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const activePoint = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="rounded-2xl border border-border bg-white/60 p-4 shadow-soft md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Biznes o'sishi</p>
          <p className="font-money text-xl font-semibold text-ink">
            {chartData.length > 0 ? `${chartData[chartData.length - 1]!.growth >= 0 ? '+' : ''}${chartData[chartData.length - 1]!.growth.toFixed(2)}%` : '—'}
          </p>
        </div>
        <div className="flex gap-1.5">
          {investors.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedInvestorId(inv.id)}
              className={clsx(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                selectedInvestorId === inv.id ? 'bg-coffee text-cream' : 'bg-cream text-ink-soft hover:bg-border/50'
              )}
            >
              {inv.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-40 select-none md:h-48">
        <ResponsiveContainer width="100%" height="100%">
          {/*
            Recharts' TypeScript definitions for LineChart don't declare
            onTouchStart/onTouchMove/onTouchEnd even though the component
            forwards and handles them at runtime exactly like the mouse
            equivalents. Casting to `any` here only relaxes the compile-time
            check - behavior is unchanged.
          */}
          {React.createElement(
            LineChart as any,
            {
              data: chartData,
              onMouseDown: (state: any) => setActiveIndex(state?.activeTooltipIndex ?? null),
              onMouseMove: (state: any) => {
                if (activeIndex !== null) setActiveIndex(state?.activeTooltipIndex ?? null);
              },
              onMouseUp: () => setActiveIndex(null),
              onTouchStart: (state: any) => setActiveIndex(state?.activeTooltipIndex ?? null),
              onTouchMove: (state: any) => setActiveIndex(state?.activeTooltipIndex ?? null),
              onTouchEnd: () => setActiveIndex(null),
              margin: { top: 8, right: 8, left: 8, bottom: 0 },
            },
            <XAxis dataKey="date" hide />,
            <YAxis hide domain={['dataMin', 'dataMax']} />,
            <Tooltip content={() => null} cursor={{ stroke: '#CD7F32', strokeWidth: 1, strokeDasharray: '3 3' }} />,
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#6F4E37"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#CD7F32', stroke: '#F5EFE3', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          )}
        </ResponsiveContainer>

        {activePoint && selectedInvestor && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[110%] animate-fadeIn rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs shadow-modal">
            <p className="font-medium text-ink-soft">{format(new Date(activePoint.date), 'dd MMM • HH:mm')}</p>
            <div className="mt-1.5 space-y-0.5">
              <p className="font-money text-ink">O'sish: <span className="font-semibold text-coffee-dark">{activePoint.growth >= 0 ? '+' : ''}{activePoint.growth.toFixed(2)}%</span></p>
              <p className="font-money text-ink">Biznes: {formatUZS(BigInt(activePoint.value))}</p>
              <p className="font-money text-ink">
                {selectedInvestor.name}: {formatUZS(computeSingleOwnershipValue(BigInt(activePoint.value), selectedInvestor.numerator, selectedInvestor.denominator))}
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-1 text-center text-[11px] text-ink-soft md:hidden">Grafikni bosib turing</p>
    </div>
  );
}
