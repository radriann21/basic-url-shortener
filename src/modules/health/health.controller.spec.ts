import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import type {
  ComponentHealth,
  HealthReport,
  OverallStatus,
} from './health.types.js';

const UP: ComponentHealth = { status: 'up', responseTimeMs: 1 };

function buildReport(status: OverallStatus): HealthReport {
  return {
    status,
    timestamp: '2026-01-01T00:00:00.000Z',
    uptimeSeconds: 12,
    components: { postgres: UP, redis: UP },
  };
}

describe('HealthController', () => {
  let controller: HealthController;
  const check = vi.fn();

  beforeEach(async () => {
    check.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { check } }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('returns the report when every component is up', async () => {
    const report = buildReport('ok');
    check.mockResolvedValue(report);

    await expect(controller.check()).resolves.toEqual(report);
  });

  it('maps an unhealthy report to 503 with the report as body', async () => {
    const report = buildReport('error');
    check.mockResolvedValue(report);

    const error = await controller.check().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getStatus()).toBe(503);
    expect((error as ServiceUnavailableException).getResponse()).toEqual(
      report,
    );
  });
});
