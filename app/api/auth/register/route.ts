import { database } from '@/lib/db';
import { createSession, sessionCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

const reply = (data: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(data, { status, headers });

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 8000)
      return reply({ error: 'Data terlalu besar.' }, 413);
    const body = (await request.json()) as Record<string, unknown>;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[\p{L}\p{N}_. -]{3,40}$/u.test(username))
      return reply({ error: 'Username harus terdiri dari 3–40 karakter.' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      return reply({ error: 'Masukkan alamat email yang valid.' }, 400);
    if (password.length < 8 || password.length > 128)
      return reply({ error: 'Password harus terdiri dari 8–128 karakter.' }, 400);

    const db = database();
    const existing = await db
      .prepare('SELECT id FROM users WHERE username=? OR email=?')
      .bind(username, email)
      .first();
    if (existing)
      return reply({ error: 'Username atau email sudah digunakan.' }, 409);

    const userId = crypto.randomUUID();
    const passwordData = await hashPassword(password);
    try {
      await db
        .prepare(
          'INSERT INTO users(id,username,email,password_hash,password_salt,created_at) VALUES(?,?,?,?,?,?)',
        )
        .bind(
          userId,
          username,
          email,
          passwordData.hash,
          passwordData.salt,
          Math.floor(Date.now() / 1000),
        )
        .run();
    } catch {
      return reply({ error: 'Username atau email sudah digunakan.' }, 409);
    }
    const token = await createSession(db, userId);
    return reply(
      { ok: true },
      201,
      { 'Set-Cookie': sessionCookie(token, new URL(request.url).protocol === 'https:') },
    );
  } catch (error) {
    console.error(
      'Registration failed',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return reply({ error: 'Pendaftaran belum berhasil. Silakan coba lagi.' }, 500);
  }
}
