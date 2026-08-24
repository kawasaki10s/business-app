// BigInt cannot be JSON.stringify'd natively. This recursively converts
// BigInt fields to strings for API responses, and provides a matching
// formatter for the UI so `so'm` amounts display correctly.

export function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v))
  );
}

/** Formats a UZS integer amount with thousands separators, e.g. 600000 -> "600 000 so'm" */
export function formatUZS(amount: bigint | number | string): string {
  const n = typeof amount === 'bigint' ? amount : BigInt(Math.trunc(Number(amount)));
  const sign = n < 0n ? '-' : '';
  const abs = n < 0n ? -n : n;
  const withSeparators = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${withSeparators} so'm`;
}
