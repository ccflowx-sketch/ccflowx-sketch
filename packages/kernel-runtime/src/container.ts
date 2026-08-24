import type { ServiceDescriptor } from "./service-descriptor.js";
import { INJECT_METADATA } from "./inject.js";

export type ProviderToken =
  | string
  | symbol;

export type ProviderLifetime =
  | "singleton"
  | "transient";

export interface Provider<T = unknown> {
  token: ProviderToken;
  useValue?: T;
  useFactory?: () => T;
  implementation?: new (...args: unknown[]) => T;
  lifetime?: ProviderLifetime;
}

interface ProviderDefinition<T = unknown> {
  useValue?: T;
  useFactory?: () => T;
  implementation?: new (...args: unknown[]) => T;
  lifetime: ProviderLifetime;
  instance?: T;
}

export class DependencyContainer {
  private readonly providers =
    new Map<
      ProviderToken,
      ProviderDefinition
    >();

  private readonly descriptors =
    new Map<
      ProviderToken,
      ServiceDescriptor
    >();

  register<T>(
    provider: Provider<T>
  ): void {
    if (this.providers.has(provider.token)) {
      throw new Error(
        `Provider already registered: ${String(provider.token)}`
      );
    }

    const hasValue =
      provider.useValue !== undefined;

    const hasFactory =
      provider.useFactory !== undefined;

    const hasImplementation =
      provider.implementation !== undefined;

    const providerCount =
      Number(hasValue) +
      Number(hasFactory) +
      Number(hasImplementation);

    if (providerCount !== 1) {
      throw new Error(
        `Provider ${String(provider.token)} must define exactly one of useValue, useFactory or implementation`
      );
    }

    const definition: ProviderDefinition<T> = {
      lifetime:
        provider.lifetime ??
        "singleton"
    };

    if (hasValue) {
  definition.useValue = provider.useValue!;
}

if (hasFactory) {
  definition.useFactory = provider.useFactory!;
}

if (hasImplementation) {
  definition.implementation =
    provider.implementation!;
}

    this.providers.set(
      provider.token,
      definition
    );
  }

  resolve<T>(
    token: ProviderToken
  ): T {
    const provider =
      this.providers.get(token);

    if (provider) {
      if (provider.useValue !== undefined) {
        return provider.useValue as T;
      }

      if (
        provider.lifetime === "singleton" &&
        provider.instance !== undefined
      ) {
        return provider.instance as T;
      }

let instance: T;

if (provider.useFactory) {
  instance =
    provider.useFactory() as T;
} else if (provider.implementation) {
  instance =
    new provider.implementation() as T;
} else {
  throw new Error(
    `Provider ${String(token)} has no implementation`
  );
}

      if (
        provider.lifetime ===
        "singleton"
      ) {
        provider.instance = instance;
      }

      return instance;
    }

    const descriptor =
      this.descriptors.get(token);

    if (!descriptor) {
      throw new Error(
        `Service not found: ${String(token)}`
      );
    }

    if (
      descriptor.useValue !== undefined
    ) {
      return descriptor.useValue as T;
    }

    if (
      !descriptor.implementation
    ) {
      throw new Error(
        `Service ${String(token)} has no implementation`
      );
    }

const dependencyTokens =
  (
    Reflect as typeof Reflect & {
      getOwnMetadata(
        metadataKey: unknown,
        target: object
      ): unknown;
    }
  ).getOwnMetadata(
    INJECT_METADATA,
    descriptor.implementation
  ) as
    | ProviderToken[]
    | undefined;

    const dependencies =
      dependencyTokens?.map(token =>
        this.resolve(token)
      ) ?? [];

    return new descriptor.implementation(
      ...dependencies
    ) as T;
  }

  has(
    token: ProviderToken
  ): boolean {
    return (
      this.providers.has(token) ||
      this.descriptors.has(token)
    );
  }

resolveDependency<T>(
  token: ProviderToken
): T {
  return this.resolve<T>(token);
}


resolveAll(): unknown[] {
  const resolved: unknown[] = [];

  for (const token of this.providers.keys()) {
    resolved.push(this.resolve(token));
  }

  return resolved;
}

resolveClass<T>(
  implementation: new (...args: any[]) => T
): T {
  return new implementation();
}


  clear(): void {
    this.providers.clear();
    this.descriptors.clear();
  }

  registerDescriptor<T>(
    descriptor: ServiceDescriptor<T>
  ): void {
    if (
      this.descriptors.has(
        descriptor.token
      )
    ) {
      throw new Error(
        `Service already registered: ${String(descriptor.token)}`
      );
    }

    this.descriptors.set(
      descriptor.token,
      descriptor
    );
  }

  getDescriptor<T>(
    token: ProviderToken
  ): ServiceDescriptor<T> | undefined {
    return this.descriptors.get(
      token
    ) as
      | ServiceDescriptor<T>
      | undefined;
  }
}