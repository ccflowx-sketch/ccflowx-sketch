export interface RuntimeHealth {
  runtimeId: string;
  version: string;
  state: string;
  uptimeMs: number;
  moduleCount: number;

  startedAt?: Date;
  stoppedAt?: Date;
  lastError?: unknown;
}