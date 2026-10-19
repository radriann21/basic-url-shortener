export type ComponentStatus = 'up' | 'down';

export type OverallStatus = 'ok' | 'error';

export interface ComponentHealth {
  status: ComponentStatus;
  responseTimeMs: number;
  /**
   * Only present when the component is down: the innermost driver error
   * message (for example `connect ECONNREFUSED 127.0.0.1:5433`). It can
   * reveal internal addresses, so this endpoint should not be exposed
   * publicly without restricting access to it.
   */
  error?: string;
}

export interface HealthReport {
  status: OverallStatus;
  timestamp: string;
  uptimeSeconds: number;
  components: {
    postgres: ComponentHealth;
    redis: ComponentHealth;
  };
}
