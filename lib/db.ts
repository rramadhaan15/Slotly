import { env } from 'cloudflare:workers';
export function database(): D1Database {
  const db = (env as unknown as { DB: D1Database }).DB;
  if (!db) throw new Error('Penyimpanan belum tersedia. Silakan coba lagi.');
  return db;
}
export function adminIds() {
  return ((env as unknown as { ADMIN_USER_IDS?: string }).ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
