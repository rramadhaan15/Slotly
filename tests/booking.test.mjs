import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import {
  HOLD_SQL,
  validSlot,
  canCancel,
  contact,
  totals,
} from '../lib/booking-domain.ts';
const now = Date.parse('2026-09-10T10:00:00+07:00');
test('reject malformed, impossible, past, and out-of-horizon slot dates', () => {
  for (const [d, h] of [
    ['bad', 8],
    ['2026-13-01', 8],
    ['2026-02-30', 8],
    ['2026-09-09', 8],
    ['2026-09-10', 9],
    ['2027-09-10', 8],
    ['2026-09-11', 7],
    ['2026-09-11', 22],
    ['2026-09-11', 8.5],
  ])
    assert.equal(validSlot(d, h, now), false);
  assert.equal(validSlot('2026-09-11', 8, now), true);
});
test('24-hour cancellation boundary uses Jakarta time', () => {
  assert.equal(canCancel('2026-09-11', 10, now), true);
  assert.equal(canCancel('2026-09-11', 9, now), false);
});
test('server totals never accept negative amounts or unknown plans', () => {
  assert.deepEqual(totals(150001, 'dp'), { price: 150001, paid: 75001 });
  assert.deepEqual(totals(85000, 'full'), { price: 85000, paid: 85000 });
  assert.throws(() => totals(-1, 'full'));
  assert.throws(() => totals(150000, 'free'));
});
test('validate customer contact', () => {
  assert.equal(contact('Rizki', '081234567890'), true);
  assert.equal(contact('', '081234567890'), false);
  assert.equal(contact('Rizki', 'letters'), false);
  assert.equal(contact('Rizki', '+6281234567890'), true);
});
function database() {
  const db = new DatabaseSync(':memory:');
  for (const file of readdirSync(
    new URL('../drizzle/', import.meta.url),
  ).filter((f) => f.endsWith('.sql')))
    db.exec(
      readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'),
    );
  return db;
}
function claim(db, user, id, expires = 1600, current = 1000, unit = 'Court A') {
  return db
    .prepare(HOLD_SQL)
    .get(
      'slot-' + unit,
      'padel',
      unit,
      '2026-09-11',
      8,
      user,
      id,
      expires,
      current,
    );
}
test('database uniqueness lets only the first requester hold the slot', () => {
  const db = database();
  assert.ok(claim(db, 'alice', 'hold-a'));
  assert.equal(claim(db, 'bob', 'hold-b'), undefined);
  assert.equal(
    db.prepare('SELECT user_id FROM slot_claims').get().user_id,
    'alice',
  );
  db.close();
});
test('expired hold is reclaimable and changes ownership atomically', () => {
  const db = database();
  claim(db, 'alice', 'hold-a', 1100);
  assert.ok(claim(db, 'bob', 'hold-b', 1700, 1100));
  assert.deepEqual(
    { ...db.prepare('SELECT user_id,hold_id FROM slot_claims').get() },
    { user_id: 'bob', hold_id: 'hold-b' },
  );
  db.close();
});
test('a booked or blocked slot cannot be stolen after the old expiry', () => {
  for (const status of ['booked', 'blocked']) {
    const db = database();
    claim(db, 'alice', 'hold-a', 1100);
    db.prepare('UPDATE slot_claims SET status=?').run(status);
    assert.equal(claim(db, 'bob', 'hold-b', 2000, 1700), undefined);
    db.close();
  }
});
test('different units can be booked at the same time', () => {
  const db = database();
  assert.ok(claim(db, 'alice', 'hold-a', 1600, 1000, 'Court A'));
  assert.ok(claim(db, 'bob', 'hold-b', 1600, 1000, 'Court B'));
  assert.equal(db.prepare('SELECT count(*) n FROM slot_claims').get().n, 2);
  db.close();
});
