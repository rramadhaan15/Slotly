import { database } from '@/lib/db';
import { createSession, sessionCookie } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

const invalid = () =>
  Response.json({ error: 'Email/username atau password tidak sesuai.' }, { status: 401 });

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 8000)
      return Response.json({ error: 'Data terlalu besar.' }, { status: 413 });
    const body = (await request.json()) as Record<string, unknown>;
    const identity = typeof body.identity === 'string' ? body.identity.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!identity || identity.length > 254 || !password || password.length > 128)
      return invalid();

    const db = database();
    const user = await db
      .prepare(
        'SELECT id,password_hash,password_salt FROM users WHERE email=? OR username=?',
      )
      .bind(identity.toLowerCase(), identity)
      .first<{ id: string; password_hash: string; password_salt: string }>();
    if (
      !user ||
      !(await verifyPassword(password, user.password_hash, user.password_salt))
    )
      return invalid();

    const token = await createSession(db, user.id);
    return Response.json(
      { ok: true },
      {
        headers: {
          'Set-Cookie': sessionCookie(
            token,
            new URL(request.url).protocol === 'https:',
          ),
        },
      },
    );
  } catch {
    return Response.json(
      { error: 'Proses masuk belum berhasil. Silakan coba lagi.' },
      { status: 500 },
    );
  }
}
