import type { ProviderToken } from "./container.js";

export interface RuntimeContext {
  readonly runtimeId: string;
  readonly correlationId: string;
  readonly createdAt: Date;

  resolve<T>(token: ProviderToken): T;
}
