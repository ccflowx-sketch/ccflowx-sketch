import { randomUUID } from "node:crypto";
import type {
  DependencyContainer,
  ProviderToken
} from "./container.js";

export interface RuntimeContext {
  readonly runtimeId: string;
  readonly correlationId: string;
  readonly createdAt: Date;

  resolve<T>(token: ProviderToken): T;
}

export class DefaultRuntimeContext
  implements RuntimeContext
{
  readonly runtimeId: string;
  readonly correlationId: string;
  readonly createdAt: Date;

  private readonly container: DependencyContainer;

  constructor(
    runtimeId: string,
    container: DependencyContainer,
    correlationId: string = randomUUID(),
    createdAt: Date = new Date()
  ) {
    this.runtimeId = runtimeId;
    this.correlationId = correlationId;
    this.createdAt = createdAt;
    this.container = container;
  }

  resolve<T>(token: ProviderToken): T {
    return this.container.resolve<T>(token);
  }
}