import type { ProviderToken } from "./container.js";

export interface DependencyResolver {
  resolve<T>(token: ProviderToken): T;
  resolveAll(): unknown[];
  resolveClass<T>(
    implementation: new (...args: any[]) => T
  ): T;
}