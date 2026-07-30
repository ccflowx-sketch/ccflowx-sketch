export interface RuntimeHealth {
  runtimeId: string;
  state: string;
  uptimeMs: number;
  moduleCount: number;
  startedAt: Date;
}
