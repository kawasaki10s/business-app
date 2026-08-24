// ============================================================
// BALANCE SPENDING LOGIC
// ------------------------------------------------------------
// When an investor spends their OWN positive balance, this is
// NOT a new loan. Only their own balance changes; no other
// investor's balance is touched.
//
// Business rule: a user may only spend up to their current
// positive balance (cannot go further negative via spending -
// going negative only happens via borrowing).
// ============================================================

import { LedgerDelta } from './loan';

export class InvalidSpendingError extends Error {}

export function computeBalanceSpendingDelta(
  userId: string,
  amount: bigint,
  currentBalance: bigint
): LedgerDelta[] {
  if (amount <= 0n) {
    throw new InvalidSpendingError("Summa musbat bo'lishi kerak");
  }
  if (amount > currentBalance) {
    throw new InvalidSpendingError("Schotdagi mablag' yetarli emas");
  }

  return [{ userId, delta: -amount }];
}
