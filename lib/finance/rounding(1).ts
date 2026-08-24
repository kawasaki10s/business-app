// ============================================================
// DETERMINISTIC ROUNDING POLICY
// ------------------------------------------------------------
// Problem: splitting a whole number (e.g. business value in UZS)
// across fractional ownership shares (1/3, 1/3, 1/3) using naive
// division loses/gains sub-unit amounts, e.g.
//   1_000_000 / 3 = 333333.33... -> floor gives 333333 * 3 = 999999
// which breaks TEST 6 (sum must equal exactly the original value).
//
// Solution: Largest Remainder Method (a.k.a. Hamilton's method).
//   1. Give everyone floor(share).
//   2. Compute the leftover units (total - sum of floors).
//   3. Distribute those leftover units one-by-one, in order of
//      who has the largest fractional remainder (ties broken by
//      a stable, deterministic order - here: array index / userId).
// This guarantees the split ALWAYS sums to exactly `total`.
// ============================================================

export type Share = {
  /** Any stable identifier - used only to break ties deterministically. */
  id: string;
  numerator: number;
  denominator: number;
};

export type SplitResult = {
  id: string;
  amount: bigint;
};

/**
 * Splits `total` (a whole number of UZS) across `shares` (exact fractions)
 * such that the sum of results is always exactly `total`.
 */
export function splitByShares(total: bigint, shares: Share[]): SplitResult[] {
  if (shares.length === 0) return [];

  const raw = shares.map((s) => {
    const numerator = BigInt(s.numerator);
    const denominator = BigInt(s.denominator);
    const floorAmount = (total * numerator) / denominator;
    const remainder = (total * numerator) % denominator; // 0 <= remainder < denominator
    return { id: s.id, floorAmount, remainder, denominator };
  });

  const sumFloors = raw.reduce((acc, r) => acc + r.floorAmount, 0n);
  let leftover = total - sumFloors; // always >= 0 for valid fractions summing to 1

  // Sort by largest remainder first; stable tie-break by original id (lexicographic)
  const sortedByRemainder = [...raw].sort((a, b) => {
    if (a.remainder === b.remainder) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    return a.remainder > b.remainder ? -1 : 1;
  });

  const bonus = new Map<string, bigint>();
  for (const entry of sortedByRemainder) {
    if (leftover <= 0n) break;
    bonus.set(entry.id, 1n);
    leftover -= 1n;
  }

  return raw.map((r) => ({
    id: r.id,
    amount: r.floorAmount + (bonus.get(r.id) ?? 0n),
  }));
}
