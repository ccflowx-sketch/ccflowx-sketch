import type { ProviderToken } from "./container.js";

export interface DependencyResolver {
  resolve<T>(token: ProviderToken): T;
  resolveAll(): unknown[];
}