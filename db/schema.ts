import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    venueId: text('venue_id').notNull(),
    unit: text('unit').notNull(),
    date: text('date').notNull(),
    hour: integer('hour').notNull(),
    price: integer('price').notNull(),
    paid: integer('paid').notNull(),
    status: text('status').notNull().default('confirmed'),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    index('booking_user_idx').on(t.userId),
    index('booking_venue_idx').on(t.venueId),
  ],
);
export const claims = sqliteTable(
  'slot_claims',
  {
    id: text('id').primaryKey(),
    venueId: text('venue_id').notNull(),
    unit: text('unit').notNull(),
    date: text('date').notNull(),
    hour: integer('hour').notNull(),
    userId: text('user_id').notNull(),
    holdId: text('hold_id').notNull(),
    expiresAt: integer('expires_at').notNull(),
    status: text('status').notNull(),
  },
  (t) => [
    uniqueIndex('unique_venue_slot').on(t.venueId, t.unit, t.date, t.hour),
  ],
);
export const favorites = sqliteTable(
  'favorites',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    venueId: text('venue_id').notNull(),
  },
  (t) => [index('favorite_user_idx').on(t.userId)],
);
export const merchants = sqliteTable(
  'merchants',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    data: text('data').notNull(),
    status: text('status').notNull().default('pending'),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [uniqueIndex('merchant_owner_idx').on(t.userId)],
);
export const audit = sqliteTable(
  'audit',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    bookingId: text('booking_id').notNull(),
    action: text('action').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('audit_user_idx').on(t.userId)],
);
export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    bookingId: text('booking_id').notNull(),
    venueId: text('venue_id').notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [uniqueIndex('review_booking_idx').on(t.bookingId)],
);
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
