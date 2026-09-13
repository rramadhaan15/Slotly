export const HOLD_SECONDS = 600;
export const MAX_BOOKING_HOURS = 4;
export const HOLD_SQL = `INSERT INTO slot_claims (id,venue_id,unit,date,hour,user_id,hold_id,expires_at,status) VALUES (?,?,?,?,?,?,?,?,'hold') ON CONFLICT(venue_id,unit,date,hour) DO UPDATE SET user_id=excluded.user_id,hold_id=excluded.hold_id,expires_at=excluded.expires_at,status='hold' WHERE slot_claims.status='hold' AND slot_claims.expires_at <= ? RETURNING hold_id,expires_at`;
export const HOLD_RANGE_SQL = `WITH RECURSIVE requested(hour) AS (
  SELECT ?
  UNION ALL
  SELECT hour + 1 FROM requested WHERE hour + 1 < ? + ?
)
INSERT INTO slot_claims (id,venue_id,unit,date,hour,user_id,hold_id,expires_at,status)
SELECT ? || hour,?,?,?,hour,?,?,?,'hold' FROM requested
WHERE NOT EXISTS (
  SELECT 1 FROM slot_claims AS existing
  JOIN requested ON requested.hour = existing.hour
  WHERE existing.venue_id=? AND existing.unit=? AND existing.date=?
    AND (existing.status!='hold' OR existing.expires_at>?)
)
ON CONFLICT(venue_id,unit,date,hour) DO UPDATE SET
  user_id=excluded.user_id,
  hold_id=excluded.hold_id,
  expires_at=excluded.expires_at,
  status='hold'
WHERE slot_claims.status='hold' AND slot_claims.expires_at<=?
RETURNING hour,hold_id,expires_at`;
export function validSlot(date: unknown, hour: unknown, now = Date.now()) {
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(hour) ||
    Number(hour) < 8 ||
    Number(hour) > 21
  )
    return false;
  const timestamp = Date.parse(
    `${date}T${String(hour).padStart(2, '0')}:00:00+07:00`,
  );
  if (!Number.isFinite(timestamp)) return false;
  const normalized = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
  return (
    normalized === date && timestamp > now && timestamp < now + 90 * 86400000
  );
}
export function validSlotRange(
  date: unknown,
  hour: unknown,
  duration: unknown,
  now = Date.now(),
) {
  if (
    !Number.isInteger(duration) ||
    Number(duration) < 1 ||
    Number(duration) > MAX_BOOKING_HOURS ||
    !Number.isInteger(hour) ||
    Number(hour) + Number(duration) > 22
  )
    return false;
  return Array.from({ length: Number(duration) }, (_, i) =>
    validSlot(date, Number(hour) + i, now),
  ).every(Boolean);
}
export function canCancel(date: string, hour: number, now = Date.now()) {
  return (
    Date.parse(`${date}T${String(hour).padStart(2, '0')}:00:00+07:00`) - now >=
    86400000
  );
}
export function contact(name: unknown, phone: unknown) {
  return (
    typeof name === 'string' &&
    name.trim().length >= 2 &&
    name.length <= 80 &&
    typeof phone === 'string' &&
    /^\+?[0-9]{9,15}$/.test(phone)
  );
}
export function totals(price: number, payment: string) {
  if (
    !Number.isInteger(price) ||
    price < 1000 ||
    price > 10000000 ||
    !['full', 'dp'].includes(payment)
  )
    throw new Error('Pilihan pembayaran tidak valid.');
  return { price, paid: payment === 'dp' ? Math.ceil(price / 2) : price };
}
