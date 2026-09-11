import { cookies } from 'next/headers';
import { database } from '@/lib/db';

export const SESSION_COOKIE = 'slotly_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

export type SlotlyUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string;
};

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function tokenHash(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  );
  return bytesToHex(new Uint8Array(digest));
}

export async function createSession(db: D1Database, userId: string) {
  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      'INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)',
    )
    .bind(await tokenHash(token), userId, now + SESSION_SECONDS, now)
    .run();
  return token;
}

export function sessionCookie(token: string, secure: boolean) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_SECONDS}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearSessionCookie(secure: boolean) {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function readSessionToken(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  for (const entry of cookie.split(';')) {
    const [name, ...value] = entry.trim().split('=');
    if (name === SESSION_COOKIE) return value.join('=');
  }
  return null;
}

export async function getSlotlyUser(): Promise<SlotlyUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const user = await database()
      .prepare(
        'SELECT users.id,users.username,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?',
      )
      .bind(await tokenHash(token), Math.floor(Date.now() / 1000))
      .first<{ id: string; username: string; email: string }>();
    if (!user) return null;
    return {
      userId: user.id,
      displayName: user.username,
      email: user.email,
      fullName: user.username,
    };
  } catch {
    return null;
  }
}
