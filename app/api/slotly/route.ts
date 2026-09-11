import { getChatGPTUser } from '@/app/chatgpt-auth';
import { database, adminIds } from '@/lib/db';
import { venues, categories, type Venue } from '@/lib/catalog';
import {
  HOLD_SQL,
  HOLD_SECONDS,
  validSlot,
  canCancel,
  contact,
  totals,
} from '@/lib/booking-domain';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
class ClientError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
async function catalog(db: D1Database) {
  const { results } = await db
    .prepare("SELECT id,data FROM merchants WHERE status='approved'")
    .all<{ id: string; data: string }>();
  return [
    ...venues,
    ...results.map((m) => {
      const { nib: _nib, ...publicData } = JSON.parse(m.data);
      return { ...publicData, id: m.id };
    }),
  ] as Venue[];
}
async function identity() {
  const user = await getChatGPTUser();
  if (!user) throw new ClientError('Silakan masuk untuk melanjutkan.', 401);
  return user;
}
function fail(error: unknown) {
  if (error instanceof ClientError)
    return reply({ error: error.message }, error.status);
  console.error(
    'Slotly request failed',
    error instanceof Error ? error.message : 'Unknown error',
  );
  return reply({ error: 'Permintaan belum berhasil. Silakan coba lagi.' }, 500);
}
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const user = await getChatGPTUser();

    // The public landing page must remain usable without a D1 binding. In local
    // development (and for signed-out visitors) the built-in catalog is all we
    // need, so avoid touching the database until an authenticated request needs
    // account or merchant data.
    if (!user && !url.searchParams.has('venue'))
      return reply({
        venues,
        user: null,
        bookings: [],
        favorites: [],
        notifications: [],
        merchant: null,
        merchantBookings: [],
        isAdmin: false,
        applications: [],
        transactions: [],
        commission: 5,
        reviewed: [],
      });

    const db = database();
    const list = await catalog(db);
    if (url.searchParams.has('venue')) {
      const venue = list.find((v) => v.id === url.searchParams.get('venue'));
      const date = url.searchParams.get('date');
      if (!venue || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new ClientError('Tempat atau tanggal tidak valid.');
      const { results } = await db
        .prepare(
          "SELECT unit,hour,status FROM slot_claims WHERE venue_id=? AND date=? AND (status!='hold' OR expires_at>?)",
        )
        .bind(venue.id, date, Math.floor(Date.now() / 1000))
        .all();
      return reply({ slots: results });
    }
    if (!user)
      return reply({
        venues: list,
        user: null,
        bookings: [],
        favorites: [],
        notifications: [],
        merchant: null,
        isAdmin: false,
      });
    const isAdmin = adminIds().includes(user.userId);
    const [bookings, favorites, events, merchant, reviews] = await Promise.all([
      db
        .prepare(
          'SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC',
        )
        .bind(user.userId)
        .all(),
      db
        .prepare('SELECT venue_id FROM favorites WHERE user_id=?')
        .bind(user.userId)
        .all(),
      db
        .prepare(
          'SELECT * FROM audit WHERE user_id=? ORDER BY created_at DESC LIMIT 20',
        )
        .bind(user.userId)
        .all(),
      db
        .prepare('SELECT * FROM merchants WHERE user_id=?')
        .bind(user.userId)
        .first<{ id: string; data: string; status: string }>(),
      db
        .prepare('SELECT booking_id FROM reviews WHERE user_id=?')
        .bind(user.userId)
        .all(),
    ]);
    const merchantBookings = merchant
      ? await db
          .prepare(
            'SELECT * FROM bookings WHERE venue_id=? ORDER BY created_at DESC',
          )
          .bind(merchant.id)
          .all()
      : { results: [] };
    const pending = isAdmin
      ? await db
          .prepare(
            'SELECT id,data,status,created_at FROM merchants ORDER BY created_at DESC',
          )
          .all()
      : { results: [] };
    const transactions = isAdmin
      ? await db
          .prepare(
            'SELECT id,venue_id,date,hour,price,paid,status,created_at FROM bookings ORDER BY created_at DESC LIMIT 100',
          )
          .all()
      : { results: [] };
    const commission = await db
      .prepare("SELECT value FROM settings WHERE key='commission'")
      .first<{ value: string }>();
    return reply({
      venues: list,
      user: { name: user.fullName ?? 'Teman Slotly', email: user.email },
      isAdmin,
      bookings: bookings.results,
      favorites: favorites.results.map((f) => f.venue_id),
      notifications: events.results,
      merchant: merchant
        ? { ...merchant, data: JSON.parse(merchant.data) }
        : null,
      merchantBookings: merchantBookings.results,
      applications: pending.results.map((m) => ({
        ...m,
        data: JSON.parse(String(m.data)),
      })),
      transactions: transactions.results,
      commission: Number(commission?.value ?? 5),
      reviewed: reviews.results.map((r) => r.booking_id),
    });
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin)
      throw new ClientError('Asal permintaan tidak valid.', 403);
    if (Number(request.headers.get('content-length') ?? 0) > 16000)
      throw new ClientError('Data terlalu besar.');
    const raw = await request.text();
    if (raw.length > 16000) throw new ClientError('Data terlalu besar.');
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new ClientError('Data tidak valid.');
    }
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new ClientError('Data tidak valid.');
    const user = await identity();
    const db = database();
    const now = Math.floor(Date.now() / 1000);
    const list = await catalog(db);
    const venue = list.find((v) => v.id === body.venueId);
    const id = crypto.randomUUID();
    if (body.action === 'favorite') {
      if (!venue) throw new ClientError('Tempat tidak ditemukan.');
      const key = user.userId + ':' + venue.id;
      if (body.saved === true)
        await db
          .prepare(
            'INSERT OR IGNORE INTO favorites(id,user_id,venue_id) VALUES(?,?,?)',
          )
          .bind(key, user.userId, venue.id)
          .run();
      else
        await db
          .prepare('DELETE FROM favorites WHERE id=? AND user_id=?')
          .bind(key, user.userId)
          .run();
      return reply({ ok: true });
    }
    if (body.action === 'hold' || body.action === 'block') {
      if (
        !venue ||
        !venue.units.includes(body.unit) ||
        !validSlot(body.date, body.hour)
      )
        throw new ClientError(
          'Pilih unit, tanggal, dan jam yang masih tersedia (maksimal 90 hari).',
        );
      if (body.action === 'block') {
        const owned = await db
          .prepare(
            "SELECT id FROM merchants WHERE id=? AND user_id=? AND status='approved'",
          )
          .bind(venue.id, user.userId)
          .first();
        if (!owned)
          throw new ClientError(
            'Anda tidak memiliki akses ke tempat ini.',
            403,
          );
      }
      const active = await db
        .prepare(
          "SELECT count(*) AS n FROM slot_claims WHERE user_id=? AND status='hold' AND expires_at>?",
        )
        .bind(user.userId, now)
        .first<{ n: number }>();
      if ((active?.n ?? 0) >= 5)
        throw new ClientError(
          'Selesaikan reservasi aktif sebelum memilih slot baru.',
          429,
        );
      const key = [venue.id, body.unit, body.date, body.hour].join('|');
      const held = await db
        .prepare(HOLD_SQL)
        .bind(
          key,
          venue.id,
          body.unit,
          body.date,
          body.hour,
          user.userId,
          id,
          now + HOLD_SECONDS,
          now,
        )
        .first();
      if (!held)
        throw new ClientError(
          'Slot baru saja terisi. Silakan pilih jam lain.',
          409,
        );
      if (body.action === 'block')
        await db
          .prepare(
            "UPDATE slot_claims SET status='blocked' WHERE hold_id=? AND user_id=?",
          )
          .bind(id, user.userId)
          .run();
      return reply({
        holdId: id,
        expiresAt: (now + HOLD_SECONDS) * 1000,
        price: venue.price,
      });
    }
    if (body.action === 'release') {
      if (typeof body.holdId !== 'string')
        throw new ClientError('Reservasi tidak valid.');
      await db
        .prepare(
          "DELETE FROM slot_claims WHERE hold_id=? AND user_id=? AND status='hold'",
        )
        .bind(body.holdId, user.userId)
        .run();
      return reply({ ok: true });
    }
    if (body.action === 'checkout') {
      if (
        !contact(body.name, body.phone) ||
        !['dp', 'full'].includes(body.payment) ||
        typeof body.holdId !== 'string'
      )
        throw new ClientError(
          'Periksa nama, nomor HP, dan pilihan pembayaran.',
        );
      const previous = await db
        .prepare('SELECT id FROM bookings WHERE id=? AND user_id=?')
        .bind(body.holdId, user.userId)
        .first();
      if (previous) return reply({ id: body.holdId });
      const held = await db
        .prepare(
          "SELECT * FROM slot_claims WHERE hold_id=? AND user_id=? AND status='hold' AND expires_at>?",
        )
        .bind(body.holdId, user.userId, now)
        .first<{ venue_id: string; date: string; hour: number }>();
      if (!held || !validSlot(held.date, held.hour))
        throw new ClientError(
          'Waktu reservasi habis. Silakan pilih slot kembali.',
          409,
        );
      const target = list.find((v) => v.id === held.venue_id);
      if (!target) throw new ClientError('Tempat tidak tersedia.');
      const cost = totals(target.price, body.payment);
      const result = await db.batch([
        db
          .prepare(
            "INSERT INTO bookings(id,user_id,venue_id,unit,date,hour,price,paid,status,name,phone,created_at) SELECT hold_id,user_id,venue_id,unit,date,hour,?,?,'confirmed',?,?,? FROM slot_claims WHERE hold_id=? AND user_id=? AND status='hold' AND expires_at>? ON CONFLICT(id) DO NOTHING",
          )
          .bind(
            cost.price,
            cost.paid,
            body.name.trim(),
            body.phone,
            now,
            body.holdId,
            user.userId,
            now,
          ),
        db
          .prepare(
            "UPDATE slot_claims SET status='booked' WHERE hold_id=? AND user_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=?)",
          )
          .bind(body.holdId, user.userId, body.holdId),
        db
          .prepare(
            'INSERT INTO audit(id,user_id,booking_id,action,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM bookings WHERE id=?)',
          )
          .bind(
            id,
            user.userId,
            body.holdId,
            'Reservasi demo dikonfirmasi',
            now,
            body.holdId,
          ),
      ]);
      if (!result[0].meta.changes)
        throw new ClientError(
          'Slot tidak tersedia lagi. Silakan pilih ulang.',
          409,
        );
      return reply({ id: body.holdId });
    }
    if (body.action === 'reschedule') {
      const booking = await db
        .prepare(
          "SELECT * FROM bookings WHERE id=? AND user_id=? AND status='confirmed'",
        )
        .bind(String(body.bookingId), user.userId)
        .first<{
          id: string;
          venue_id: string;
          unit: string;
          date: string;
          hour: number;
        }>();
      if (
        !booking ||
        !canCancel(booking.date, booking.hour) ||
        !validSlot(body.date, body.hour)
      )
        throw new ClientError(
          'Perubahan jadwal tersedia minimal 24 jam sebelum kunjungan. Pilih jadwal baru yang valid.',
        );
      if (booking.date === body.date && booking.hour === body.hour)
        throw new ClientError(
          'Pilih waktu yang berbeda dari jadwal sebelumnya.',
        );
      const target = list.find((v) => v.id === booking.venue_id);
      if (!target || !target.units.includes(booking.unit))
        throw new ClientError(
          'Layanan ini tidak tersedia untuk perubahan jadwal.',
        );
      const key = [booking.venue_id, booking.unit, body.date, body.hour].join(
        '|',
      );
      const changed = await db.batch([
        db
          .prepare(HOLD_SQL)
          .bind(
            key,
            booking.venue_id,
            booking.unit,
            body.date,
            body.hour,
            user.userId,
            id,
            now + HOLD_SECONDS,
            now,
          ),
        db
          .prepare(
            "UPDATE bookings SET date=?,hour=? WHERE id=? AND user_id=? AND status='confirmed' AND date=? AND hour=? AND EXISTS(SELECT 1 FROM slot_claims WHERE hold_id=? AND user_id=? AND status='hold')",
          )
          .bind(
            body.date,
            body.hour,
            booking.id,
            user.userId,
            booking.date,
            booking.hour,
            id,
            user.userId,
          ),
        db
          .prepare(
            "DELETE FROM slot_claims WHERE hold_id=? AND user_id=? AND status='booked' AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND date=? AND hour=? AND status='confirmed') AND EXISTS(SELECT 1 FROM slot_claims WHERE hold_id=?)",
          )
          .bind(booking.id, user.userId, booking.id, body.date, body.hour, id),
        db
          .prepare(
            "UPDATE slot_claims SET status='booked',hold_id=? WHERE hold_id=? AND user_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND date=? AND hour=? AND status='confirmed')",
          )
          .bind(booking.id, id, user.userId, booking.id, body.date, body.hour),
        db
          .prepare(
            "INSERT INTO audit(id,user_id,booking_id,action,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM slot_claims WHERE id=? AND hold_id=? AND status='booked')",
          )
          .bind(
            id,
            user.userId,
            booking.id,
            'Jadwal reservasi diubah',
            now,
            key,
            booking.id,
          ),
        db
          .prepare(
            "DELETE FROM slot_claims WHERE hold_id=? AND user_id=? AND status='hold'",
          )
          .bind(id, user.userId),
      ]);
      if (!changed[1].meta.changes)
        throw new ClientError(
          'Slot baru sudah terisi atau reservasi telah berubah. Jadwal sebelumnya tetap tersimpan.',
          409,
        );
      return reply({ ok: true });
    }
    if (body.action === 'unblock') {
      if (
        !venue ||
        !venue.units.includes(body.unit) ||
        !validSlot(body.date, body.hour)
      )
        throw new ClientError('Pilih unit, tanggal, dan jam yang valid.');
      const owned = await db
        .prepare(
          "SELECT id FROM merchants WHERE id=? AND user_id=? AND status='approved'",
        )
        .bind(venue.id, user.userId)
        .first();
      if (!owned)
        throw new ClientError('Anda tidak memiliki akses ke tempat ini.', 403);
      const result = await db
        .prepare(
          "DELETE FROM slot_claims WHERE venue_id=? AND unit=? AND date=? AND hour=? AND user_id=? AND status='blocked'",
        )
        .bind(venue.id, body.unit, body.date, body.hour, user.userId)
        .run();
      if (!result.meta.changes)
        throw new ClientError('Tidak ada blokir manual pada slot ini.');
      return reply({ ok: true });
    }
    if (body.action === 'cancel') {
      const b = await db
        .prepare('SELECT * FROM bookings WHERE id=? AND user_id=?')
        .bind(String(body.bookingId), user.userId)
        .first<{ id: string; date: string; hour: number; status: string }>();
      if (!b || b.status !== 'confirmed')
        throw new ClientError('Booking tidak dapat dibatalkan.');
      if (!canCancel(b.date, b.hour))
        throw new ClientError(
          'Pembatalan hanya tersedia minimal 24 jam sebelum jadwal.',
        );
      await db.batch([
        db
          .prepare(
            "UPDATE bookings SET status='cancelled' WHERE id=? AND user_id=?",
          )
          .bind(b.id, user.userId),
        db
          .prepare(
            "DELETE FROM slot_claims WHERE hold_id=? AND user_id=? AND status='booked'",
          )
          .bind(b.id, user.userId),
        db
          .prepare('INSERT INTO audit VALUES(?,?,?,?,?)')
          .bind(id, user.userId, b.id, 'Reservasi demo dibatalkan', now),
      ]);
      return reply({ ok: true });
    }
    if (body.action === 'review') {
      const b = await db
        .prepare(
          "SELECT * FROM bookings WHERE id=? AND user_id=? AND status='confirmed'",
        )
        .bind(String(body.bookingId), user.userId)
        .first<{ venue_id: string; date: string; hour: number }>();
      if (
        !b ||
        Date.parse(
          `${b.date}T${String(b.hour + 1).padStart(2, '0')}:00:00+07:00`,
        ) > Date.now()
      )
        throw new ClientError('Ulasan tersedia setelah jadwal selesai.');
      if (
        !Number.isInteger(body.rating) ||
        body.rating < 1 ||
        body.rating > 5 ||
        typeof body.comment !== 'string' ||
        body.comment.trim().length < 5 ||
        body.comment.length > 1000
      )
        throw new ClientError('Beri rating 1–5 dan ulasan 5–1.000 karakter.');
      await db
        .prepare(
          'INSERT INTO reviews VALUES(?,?,?,?,?,?,?) ON CONFLICT(booking_id) DO NOTHING',
        )
        .bind(
          id,
          user.userId,
          body.bookingId,
          b.venue_id,
          body.rating,
          body.comment.trim(),
          now,
        )
        .run();
      return reply({ ok: true });
    }
    if (body.action === 'merchant') {
      if (
        typeof body.name !== 'string' ||
        body.name.trim().length < 3 ||
        body.name.length > 100 ||
        !categories.slice(1).includes(body.category) ||
        !Number.isInteger(body.price) ||
        body.price < 1000 ||
        body.price > 10000000 ||
        typeof body.area !== 'string' ||
        body.area.trim().length < 2 ||
        body.area.length > 80 ||
        typeof body.description !== 'string' ||
        body.description.length < 20 ||
        body.description.length > 1000 ||
        !Array.isArray(body.units) ||
        body.units.length < 1 ||
        body.units.length > 10 ||
        body.units.some(
          (u: unknown) => typeof u !== 'string' || !u.trim() || u.length > 60,
        ) ||
        new Set(body.units).size !== body.units.length ||
        !/^\d{13}$/.test(body.nib)
      )
        throw new ClientError(
          'Lengkapi profil usaha, minimal satu unit, dan NIB 13 digit.',
        );
      const data = {
        name: body.name.trim(),
        category: body.category,
        price: body.price,
        area: body.area.trim(),
        city: 'Jakarta Selatan',
        description: body.description,
        units: body.units,
        image:
          venues.find((v) => v.category === body.category)?.image ??
          venues[0].image,
        facilities: ['Reservasi online'],
        rating: 0,
        reviews: 0,
        distance: 0,
        tag: 'Baru',
        nib: body.nib,
      };
      const existing = await db
        .prepare('SELECT id FROM merchants WHERE user_id=?')
        .bind(user.userId)
        .first<{ id: string }>();
      await db
        .prepare(
          "INSERT INTO merchants(id,user_id,data,status,created_at) VALUES(?,?,?,'pending',?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,status='pending'",
        )
        .bind(existing?.id ?? id, user.userId, JSON.stringify(data), now)
        .run();
      return reply({ ok: true });
    }
    if (body.action === 'approve' || body.action === 'commission') {
      if (!adminIds().includes(user.userId))
        throw new ClientError('Akses hanya untuk admin platform.', 403);
      if (body.action === 'approve') {
        if (
          !['approved', 'rejected'].includes(body.status) ||
          typeof body.merchantId !== 'string'
        )
          throw new ClientError('Status tidak valid.');
        await db
          .prepare('UPDATE merchants SET status=? WHERE id=?')
          .bind(body.status, body.merchantId)
          .run();
      } else {
        if (typeof body.value !== 'number' || body.value < 0 || body.value > 30)
          throw new ClientError('Komisi harus 0–30%.');
        await db
          .prepare(
            "INSERT INTO settings(key,value) VALUES('commission',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .bind(String(body.value))
          .run();
      }
      return reply({ ok: true });
    }
    throw new ClientError('Aksi tidak tersedia.');
  } catch (e) {
    return fail(e);
  }
}
