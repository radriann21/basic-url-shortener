import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants.js';
import { describeError } from './describe-error.js';
import type { ComponentHealth, HealthReport } from './health.types.js';
import { withTimeout } from './with-timeout.js';

const COMPONENT_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async check(): Promise<HealthReport> {
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const healthy = postgres.status === 'up' && redis.status === 'up';

    return {
      status: healthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      components: { postgres, redis },
    };
  }

  private checkPostgres(): Promise<ComponentHealth> {
    return this.probe('postgres', async () => {
      await withTimeout(
        this.db.execute(sql`select 1`),
        COMPONENT_TIMEOUT_MS,
        'Postgres did not respond in time',
      );
    });
  }

  private checkRedis(): Promise<ComponentHealth> {
    return this.probe('redis', async () => {
      const reply = await withTimeout(
        this.redis.ping(),
        COMPONENT_TIMEOUT_MS,
        'Redis did not respond in time',
      );

      if (reply !== 'PONG') {
        throw new Error(`Unexpected reply to PING: ${String(reply)}`);
      }
    });
  }

  private async probe(
    component: keyof HealthReport['components'],
    operation: () => Promise<void>,
  ): Promise<ComponentHealth> {
    const startedAt = performance.now();

    try {
      await operation();

      return {
        status: 'up',
        responseTimeMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      const message = describeError(error);

      this.logger.error(
        `Health check failed for ${component}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        status: 'down',
        responseTimeMs: Math.round(performance.now() - startedAt),
        error: message,
      };
    }
  }
}
