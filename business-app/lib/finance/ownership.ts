import { splitByShares, Share } from './rounding';

// ============================================================
// OWNERSHIP CALCULATION
// ------------------------------------------------------------
// Ownership value is NEVER stored - it is always derived from:
//   businessValue (current or historical) x ownership fraction
// This file is the single source of truth for that math.
// ============================================================

export type OwnershipShare = {
  userId: string;
  numerator: number;
  denominator: number;
};

export type OwnershipValue = {
  userId: string;
  value: bigint;
};

/**
 * Computes each investor's ownership value for a given business value,
 * guaranteeing the sum equals exactly `businessValue` (see rounding.ts).
 */
export function computeOwnershipValues(
  businessValue: bigint,
  shares: OwnershipShare[]
): OwnershipValue[] {
  const asShares: Share[] = shares.map((s) => ({
    id: s.userId,
    numerator: s.numerator,
    denominator: s.denominator,
  }));

  const split = splitByShares(businessValue, asShares);
  return split.map((s) => ({ userId: s.id, value: s.amount }));
}

/** Ownership value for a single investor (used e.g. in the graph tooltip). */
export function computeSingleOwnershipValue(
  businessValue: bigint,
  numerator: number,
  denominator: number
): bigint {
  // Simple truncated division is fine for a single-investor lookup;
  // exact-sum guarantees only matter when splitting across ALL investors.
  return (businessValue * BigInt(numerator)) / BigInt(denominator);
}

/** Formats an ownership fraction as a display percentage, e.g. "33.33%". Display only - never used in calculations. */
export function formatOwnershipPercent(numerator: number, denominator: number): string {
  const pct = (numerator / denominator) * 100;
  return `${pct.toFixed(2)}%`;
}
