import type { RuntimeMetrics } from "./runtime-metrics.js";

export interface RuntimeSnapshot {
  runtimeId: string;
  state: string;
  createdAt: Date;
  modules: readonly string[];
  metrics: RuntimeMetrics;
}