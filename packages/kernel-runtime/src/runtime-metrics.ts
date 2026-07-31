export interface RuntimeMetrics {
  startCount: number;
  stopCount: number;
  failureCount: number;
  registeredModules: number;

  lastStartupTimeMs: number;
  averageStartupTimeMs: number;

  lastShutdownTimeMs: number;
  averageShutdownTimeMs: number;
}