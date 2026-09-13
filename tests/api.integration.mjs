import assert from 'node:assert/strict';
const base = 'http://localhost:3000';
const login = await fetch(base + '/signin-with-chatgpt?return_to=/', {
  redirect: 'manual',
});
const cookies = login.headers
  .getSetCookie()
  .map((c) => c.split(';')[0])
  .join('; ');
assert.ok(cookies, 'local sign-in cookie');
const call = async (data, cookie = cookies) => {
  const r = await fetch(base + '/api/slotly', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      Origin: base,
    },
    body: JSON.stringify(data),
  });
  return { status: r.status, data: await r.json() };
};
const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
let savedId;
try {
  assert.equal(
    (await call({ action: 'favorite', venueId: 'padel', saved: true }, ''))
      .status,
    401,
  );
  assert.equal(
    (await call({ action: 'approve', merchantId: 'x', status: 'approved' }))
      .status,
    403,
  );
  assert.equal(
    (await call({ action: 'merchant', name: 'Usaha pengguna' })).status,
    403,
  );
  assert.equal(
    (
      await call({
        action: 'adminVenue',
        name: 'Venue tanpa izin',
        category: 'Olahraga',
        price: 100000,
        area: 'Kemang',
        description: 'Venue ini tidak boleh dibuat oleh pengguna biasa.',
        units: ['Lapangan A'],
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call({
        action: 'hold',
        venueId: 'padel',
        unit: 'invalid',
        date,
        hour: 8,
      })
    ).status,
    400,
  );
  const concurrent = await Promise.all([
    call({ action: 'hold', venueId: 'padel', unit: 'Court C', date, hour: 8 }),
    call({ action: 'hold', venueId: 'padel', unit: 'Court C', date, hour: 8 }),
  ]);
  assert.deepEqual(
    concurrent.map((r) => r.status).sort((a, b) => a - b),
    [200, 409],
  );
  const hold = concurrent.find((r) => r.status === 200).data;
  savedId = hold.holdId;
  const payload = {
    action: 'checkout',
    holdId: hold.holdId,
    name: 'Pelanggan Uji',
    phone: '081234567890',
    payment: 'dp',
  };
  assert.equal((await call({ ...payload, phone: 'invalid' })).status, 400);
  assert.equal((await call(payload)).status, 200);
  assert.equal((await call(payload)).status, 200);
  const profile = await (
    await fetch(base + '/api/slotly', { headers: { Cookie: cookies } })
  ).json();
  const b = profile.bookings.find((b) => b.id === hold.holdId);
  assert.equal(b.paid, 75000);
  assert.equal(b.price, 150000);
  assert.equal(profile.bookings.filter((b) => b.id === hold.holdId).length, 1);
  assert.equal(
    (
      await call({
        action: 'hold',
        venueId: 'padel',
        unit: 'Court C',
        date,
        hour: 8,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call({
        action: 'review',
        bookingId: hold.holdId,
        rating: 5,
        comment: 'Pengalaman bagus',
      })
    ).status,
    400,
  );
  const occupied = await call({
    action: 'hold',
    venueId: 'padel',
    unit: 'Court C',
    date,
    hour: 9,
  });
  assert.equal(occupied.status, 200);
  assert.equal(
    (
      await call({
        action: 'reschedule',
        bookingId: hold.holdId,
        date,
        hour: 9,
      })
    ).status,
    409,
  );
  const unchanged = await (
    await fetch(base + '/api/slotly', { headers: { Cookie: cookies } })
  ).json();
  assert.equal(unchanged.bookings.find((b) => b.id === hold.holdId).hour, 8);
  await call({ action: 'release', holdId: occupied.data.holdId });
  assert.equal(
    (
      await call({
        action: 'reschedule',
        bookingId: hold.holdId,
        date,
        hour: 9,
      })
    ).status,
    200,
  );
  const moved = await (
    await fetch(base + '/api/slotly', { headers: { Cookie: cookies } })
  ).json();
  assert.equal(moved.bookings.find((b) => b.id === hold.holdId).hour, 9);
  const newSlot = await call({
    action: 'hold',
    venueId: 'padel',
    unit: 'Court C',
    date,
    hour: 9,
  });
  assert.equal(newSlot.status, 409);
  assert.equal(
    (await call({ action: 'cancel', bookingId: hold.holdId })).status,
    200,
  );
  assert.equal(
    (await call({ action: 'cancel', bookingId: hold.holdId })).status,
    400,
  );
  const again = await call({
    action: 'hold',
    venueId: 'padel',
    unit: 'Court C',
    date,
    hour: 8,
  });
  assert.equal(again.status, 200);
  await call({ action: 'release', holdId: again.data.holdId });
  const f = await call({ action: 'favorite', venueId: 'studio', saved: true });
  assert.equal(f.status, 200);
  const reloaded = await (
    await fetch(base + '/api/slotly', { headers: { Cookie: cookies } })
  ).json();
  assert.ok(reloaded.favorites.includes('studio'));
  await call({ action: 'favorite', venueId: 'studio', saved: false });
  const foreign = await fetch(base + '/api/slotly', {
    method: 'POST',
    headers: {
      Cookie: cookies,
      Origin: 'https://foreign.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'favorite', venueId: 'padel', saved: true }),
  });
  assert.equal(foreign.status, 403);
  console.log(
    'PASS: authenticated booking, concurrent conflict, DP price, idempotency, cancellation, favorites persistence, role and origin enforcement.',
  );
} finally {
  if (savedId) await call({ action: 'release', holdId: savedId });
}
