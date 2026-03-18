import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  date,
  decimal,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  githubId: varchar('github_id').unique().notNull(),
  username: varchar('username').notNull(),
  avatarUrl: varchar('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ─── species ──────────────────────────────────────────────────────────────────

export const species = pgTable(
  'species',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    bestPhotoId: uuid('best_photo_id'), // FK to photos.id (set null on delete) — managed via db:push
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    uniqueIndex('species_user_id_name_uidx').on(table.userId, table.name),
    index('species_user_id_sort_order_idx').on(table.userId, table.sortOrder),
  ],
);

// ─── sightings ────────────────────────────────────────────────────────────────

export const sightings = pgTable(
  'sightings',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    memo: text('memo'),
    sightedAt: date('sighted_at').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    locationName: varchar('location_name', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('sightings_user_id_sighted_at_idx').on(table.userId, table.sightedAt),
  ],
);

// ─── photos ───────────────────────────────────────────────────────────────────

export const photos = pgTable(
  'photos',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sightingId: uuid('sighting_id')
      .notNull()
      .references(() => sightings.id, { onDelete: 'cascade' }),
    speciesId: uuid('species_id')
      .notNull()
      .references(() => species.id, { onDelete: 'restrict' }),
    blobUrl: varchar('blob_url').notNull(),
    thumbnailUrl: varchar('thumbnail_url'),
    originalFilename: varchar('original_filename').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('photos_species_id_created_at_idx').on(table.speciesId, table.createdAt),
  ],
);

// ─── Inferred types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;

export type Sighting = typeof sightings.$inferSelect;
export type NewSighting = typeof sightings.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
