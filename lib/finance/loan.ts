// ============================================================
// LOAN LOGIC
// ------------------------------------------------------------
// System is fixed to exactly 3 investors (confirmed requirement).
// When investor X borrows `amount`:
//   X's balance         -= amount
//   each OTHER investor's balance += amount  (NOT split/divided)
//
// This is completely separate from Investment/Ownership/Business
// value. A loan NEVER changes ownership or investment records.
//
// Each new loan is an independent, immutable transaction. Existing
// loan transactions are never mutated to "add" more debt - a new
// loan wanting more money creates a brand new transaction.
// ============================================================

export type LedgerDelta = {
  userId: string;
  delta: bigint; // signed
};

export class InvalidLoanError extends Error {}

/**
 * Computes the ledger deltas for a new loan.
 * `allInvestorIds` MUST contain exactly 3 investor user ids, including the borrower.
 */
export function computeLoanLedgerDeltas(
  borrowerId: string,
  amount: bigint,
  allInvestorIds: string[]
): LedgerDelta[] {
  if (amount <= 0n) {
    throw new InvalidLoanError("Qarz summasi musbat bo'lishi kerak");
  }
  if (allInvestorIds.length !== 3) {
    throw new InvalidLoanError('Tizim aynan 3 investor uchun mo\'ljallangan');
  }
  if (!allInvestorIds.includes(borrowerId)) {
    throw new InvalidLoanError("Qarz oluvchi investorlar ro'yxatida topilmadi");
  }

  const deltas: LedgerDelta[] = allInvestorIds.map((userId) => ({
    userId,
    delta: userId === borrowerId ? -amount : amount,
  }));

  // Sanity check: for a 3-party loan (1 borrower, 2 lenders each +amount),
  // the ledger does NOT sum to zero by design (this is not a closed pool -
  // the borrowed value effectively comes "from the business"/external), but
  // we assert the borrower's leg is consistent with the two counter-legs.
  const borrowerLeg = deltas.find((d) => d.userId === borrowerId)!.delta;
  const otherLegsSum = deltas.filter((d) => d.userId !== borrowerId).reduce((a, d) => a + d.delta, 0n);
  if (otherLegsSum !== amount * 2n || borrowerLeg !== -amount) {
    // Defensive - should be unreachable given the logic above.
    throw new InvalidLoanError('Ledger hisob-kitobida nomuvofiqlik aniqlandi');
  }

  return deltas;
}
