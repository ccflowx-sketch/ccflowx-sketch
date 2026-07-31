import type { RuntimeMetrics } from "./runtime-metrics.js";
import type { RuntimeState } from "./runtime.js";

export interface RuntimeSnapshot {
  runtimeId: string;
  version: string;
  state: RuntimeState;
  createdAt: Date;
  modules: string[];
  metrics: RuntimeMetrics;
}