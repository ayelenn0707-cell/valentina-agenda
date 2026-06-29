import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getConfig, setConfig } from './db';

/**
 * Ensure a PIN hash exists in the config table.
 * If none is stored, hashes the default PIN "1234" and persists it.
 * Safe to call multiple times — only writes if missing.
 */
export async function initPin(): Promise<void> {
  const hash = getConfig('pin_hash');
  if (!hash) {
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync('1234', salt);
    setConfig('pin_hash', hashed);
  }
}

/**
 * Compare a raw PIN against the stored bcrypt hash.
 * Returns false when no hash has been initialised yet.
 */
export function verifyPin(pin: string): boolean {
  const hash = getConfig('pin_hash');
  if (!hash) return false;
  return bcrypt.compareSync(pin, hash);
}

/**
 * Set a httpOnly session cookie valid for 30 days.
 * Must be called from a Server Component or Route Handler.
 */
export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('session', '1', {
    httpOnly: true,
    path: '/',
    maxAge: 86_400 * 30, // 30 days
    sameSite: 'lax',
  });
}

/**
 * Returns true when a valid session cookie exists.
 * Must be called from a Server Component or Route Handler.
 */
export async function checkSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value === '1';
}

/**
 * Delete the session cookie (log out).
 * Must be called from a Server Component or Route Handler.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
