import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { THROTTLER_NAMES } from '../../config/configuration.js';
import { HealthService } from './health.service.js';
import type { HealthReport } from './health.types.js';

const SKIP_EVERY_THROTTLER: Record<string, boolean> = Object.fromEntries(
  Object.values(THROTTLER_NAMES).map((name): [string, boolean] => [name, true]),
);

@Controller('health')
@SkipThrottle(SKIP_EVERY_THROTTLER)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthReport> {
    const report = await this.healthService.check();

    if (report.status !== 'ok') {
      throw new ServiceUnavailableException(report);
    }

    return report;
  }
}
