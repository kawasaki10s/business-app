import crypto from 'crypto';

// ============================================================
// Full card numbers are NEVER stored in plain form and NEVER
// returned to the client. Only the last 4 digits are kept in
// plain form for UI display (**** 4821 style masking).
// The full reference (if ever needed for a real payment processor
// integration) is encrypted at rest with AES-256-GCM.
// ============================================================

function getKey(): Buffer {
  const key = process.env.CARD_ENCRYPTION_KEY;
  if (!key) throw new Error('CARD_ENCRYPTION_KEY .env da sozlanmagan');
  return Buffer.from(key, 'base64');
}

export function encryptCardRef(fullCardNumber: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(fullCardNumber, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function maskCardNumber(fullCardNumber: string): string {
  const digitsOnly = fullCardNumber.replace(/\D/g, '');
  return digitsOnly.slice(-4);
}
