import { Logger } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { Test } from '@nestjs/testing';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  let execute: ReturnType<typeof vi.fn>;
  let ping: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    execute = vi.fn().mockResolvedValue([{ '?column?': 1 }]);
    ping = vi.fn().mockResolvedValue('PONG');

    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getDrizzleToken(),
          useValue: { execute } as unknown as NodePgDatabase,
        },
        { provide: REDIS_CLIENT, useValue: { ping } as unknown as Redis },
      ],
    }).compile();

    service = moduleRef.get(HealthService);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports ok when every component answers', async () => {
    const report = await service.check();

    expect(report.status).toBe('ok');
    expect(report.components.postgres.status).toBe('up');
    expect(report.components.redis.status).toBe('up');
    expect(ping).toHaveBeenCalled();
  });

  it('reports error when postgres fails, without hiding the redis state', async () => {
    execute.mockRejectedValue(
      new Error('Failed query: select 1', {
        cause: new AggregateError([new Error('connect ECONNREFUSED ::1:5433')]),
      }),
    );

    const report = await service.check();

    expect(report.status).toBe('error');
    expect(report.components.postgres).toMatchObject({
      status: 'down',
      error: 'connect ECONNREFUSED ::1:5433',
    });
    expect(report.components.redis.status).toBe('up');
  });

  it('reports error when redis answers something other than PONG', async () => {
    ping.mockResolvedValue('LOADING');

    const report = await service.check();

    expect(report.status).toBe('error');
    expect(report.components.redis).toMatchObject({ status: 'down' });
    expect(report.components.redis.error).toContain('LOADING');
  });

  it('measures the response time of every component', async () => {
    const report = await service.check();

    expect(report.components.postgres.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(report.components.redis.responseTimeMs).toBeGreaterThanOrEqual(0);
  });
});
