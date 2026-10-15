import {
  bigint,
  boolean,
  index,
  inet,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  long_url: text('long_url').notNull(),
  slug: varchar('slug', { length: 10 }).notNull().unique('idx_urls_slug'),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clicks = pgTable(
  'clicks',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    url_id: bigint('url_id', { mode: 'number' })
      .notNull()
      .references(() => urls.id),
    ip_address: inet('ip_address'),
    user_agent: text('user_agent'),
    referer: text('referer'),
    country_code: varchar('country_code', { length: 3 }),
    clicked_at: timestamp('clicked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('idx_clicks_url_id').on(t.url_id)],
);
