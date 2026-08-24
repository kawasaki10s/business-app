// ============================================================
// BUSINESS GROWTH CALCULATION
// growth% = (currentValue - initialValue) / initialValue * 100
// ============================================================

export function computeGrowthPercent(initialValue: bigint, currentValue: bigint): number {
  if (initialValue === 0n) return 0;
  const diff = currentValue - initialValue;
  // Use Number here only for display purposes (percentages), never for money math.
  return (Number(diff) / Number(initialValue)) * 100;
}

export function formatGrowthPercent(pct: number): string {
  const sign = pct > 0 ? '+' : pct < 0 ? '' : '';
  return `${sign}${pct.toFixed(2)}%`;
}
