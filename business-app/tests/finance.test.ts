import { describe, it, expect } from 'vitest';
import {
  computeLoanLedgerDeltas,
  computeBalanceSpendingDelta,
  computeOwnershipValues,
  computeGrowthPercent,
} from '@/lib/finance';

const [U1, U2, U3] = ['user1', 'user2', 'user3'];
const ALL = [U1, U2, U3];

describe('TEST 1: User1 borrows 10 000 from a zero-balance state', () => {
  it('produces -10000 / +10000 / +10000', () => {
    const deltas = computeLoanLedgerDeltas(U1, 10_000n, ALL);
    const byUser = Object.fromEntries(deltas.map((d) => [d.userId, d.delta]));
    expect(byUser[U1]).toBe(-10_000n);
    expect(byUser[U2]).toBe(10_000n);
    expect(byUser[U3]).toBe(10_000n);
  });
});

describe('TEST 2: User2 spends 10 000 from their balance', () => {
  it('only affects User2, User1 and User3 stay unchanged', () => {
    // Starting balances after TEST 1: U1=-10000, U2=10000, U3=10000
    const deltas = computeBalanceSpendingDelta(U2, 10_000n, 10_000n);
    expect(deltas).toEqual([{ userId: U2, delta: -10_000n }]);

    // Simulated resulting balances
    const u1 = -10_000n;
    const u2 = 10_000n + deltas[0]!.delta; // 10000 - 10000 = 0
    const u3 = 10_000n;

    expect(u1).toBe(-10_000n);
    expect(u2).toBe(0n);
    expect(u3).toBe(10_000n);
  });
});

describe('TEST 3: User2 borrows another 10 000', () => {
  it('results in U1=0, U2=-10000, U3=+20000', () => {
    // Starting balances after TEST 2: U1=-10000, U2=0, U3=10000
    const deltas = computeLoanLedgerDeltas(U2, 10_000n, ALL);
    const byUser = Object.fromEntries(deltas.map((d) => [d.userId, d.delta]));

    const u1 = -10_000n + byUser[U1]!; // -10000 + 10000 = 0
    const u2 = 0n + byUser[U2]!; // 0 - 10000 = -10000
    const u3 = 10_000n + byUser[U3]!; // 10000 + 10000 = 20000

    expect(u1).toBe(0n);
    expect(u2).toBe(-10_000n);
    expect(u3).toBe(20_000n);
  });
});

describe('TEST 4: Business value 300 000 -> 600 000, equal 1/3 ownership', () => {
  it('each investor ownership value = 200 000', () => {
    const shares = ALL.map((id) => ({ userId: id, numerator: 1, denominator: 3 }));
    const values = computeOwnershipValues(600_000n, shares);
    for (const v of values) {
      expect(v.value).toBe(200_000n);
    }
  });
});

describe('TEST 5: Business value 300 000 -> 450 000', () => {
  it('growth is exactly +50%', () => {
    const growth = computeGrowthPercent(300_000n, 450_000n);
    expect(growth).toBeCloseTo(50, 5);
  });
});

describe('TEST 6: Business value 1 000 000 split across 3 equal investors', () => {
  it('ownership values sum EXACTLY to 1 000 000 (no 999999 / 1000001)', () => {
    const shares = ALL.map((id) => ({ userId: id, numerator: 1, denominator: 3 }));
    const values = computeOwnershipValues(1_000_000n, shares);
    const sum = values.reduce((acc, v) => acc + v.value, 0n);
    expect(sum).toBe(1_000_000n);
    // Also verify no value is wildly off from the naive 333333 expectation
    for (const v of values) {
      expect(v.value === 333_333n || v.value === 333_334n).toBe(true);
    }
  });
});

describe('Edge cases / validation', () => {
  it('rejects a loan with a non-positive amount', () => {
    expect(() => computeLoanLedgerDeltas(U1, 0n, ALL)).toThrow();
    expect(() => computeLoanLedgerDeltas(U1, -100n, ALL)).toThrow();
  });

  it('rejects a loan when investor list is not exactly 3', () => {
    expect(() => computeLoanLedgerDeltas(U1, 100n, [U1, U2])).toThrow();
  });

  it('rejects balance spending beyond current balance', () => {
    expect(() => computeBalanceSpendingDelta(U1, 100n, 50n)).toThrow();
  });

  it('rounding never loses or gains money across many odd splits', () => {
    const shares = ALL.map((id) => ({ userId: id, numerator: 1, denominator: 3 }));
    for (const total of [1n, 2n, 7n, 999n, 1_234_567n, 999_999_999n]) {
      const values = computeOwnershipValues(total, shares);
      const sum = values.reduce((acc, v) => acc + v.value, 0n);
      expect(sum).toBe(total);
    }
  });
});
