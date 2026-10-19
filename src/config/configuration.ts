/**
 * Names of the throttlers registered in AppModule. Exported so that endpoints
 * which must never be rate limited (health checks) can skip every one of them.
 */
export const THROTTLER_NAMES = {
  short: 'short',
  medium: 'medium',
  long: 'long',
} as const;

export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  webUrl: process.env.WEB_URL?.replace(/\/+$/, ''),
  postgres: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: parseInt(process.env.POSTGRES_PORT ?? '', 10) || 5433,
  },
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    password: process.env.REDIS_PASSWORD,
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
  },
  throttler: [
    {
      name: THROTTLER_NAMES.short,
      ttl: parseInt(process.env.THROTTLE_SHORT_TTL ?? '', 10) || 1000,
      limit: parseInt(process.env.THROTTLE_SHORT_LIMIT ?? '', 10) || 3,
    },
    {
      name: THROTTLER_NAMES.medium,
      ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL ?? '', 10) || 10000,
      limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT ?? '', 10) || 20,
    },
    {
      name: THROTTLER_NAMES.long,
      ttl: parseInt(process.env.THROTTLE_LONG_TTL ?? '', 10) || 60000,
      limit: parseInt(process.env.THROTTLE_LONG_LIMIT ?? '', 10) || 100,
    },
  ],
});
