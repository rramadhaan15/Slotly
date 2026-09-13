import { clearSessionCookie, readSessionToken, tokenHash } from '@/lib/auth';
import { database } from '@/lib/db';

export async function POST(request: Request) {
  const secure = new URL(request.url).protocol === 'https:';
  const token = readSessionToken(request);
  if (token) {
    try {
      await database()
        .prepare('DELETE FROM sessions WHERE token_hash=?')
        .bind(await tokenHash(token))
        .run();
    } catch {}
  }
  return Response.json(
    { ok: true },
    { headers: { 'Set-Cookie': clearSessionCookie(secure) } },
  );
}
