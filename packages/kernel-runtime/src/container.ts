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
  lifetime?: ProviderLifetime;
}

interface ProviderDefinition<T = unknown> {
  useValue?: T;
  useFactory?: () => T;
  lifetime: ProviderLifetime;
  instance?: T;
}

export class DependencyContainer {
  private readonly providers =
    new Map<
      ProviderToken,
      ProviderDefinition
    >();

  register<T>(
    provider: Provider<T>
  ): void {
    if (
      this.providers.has(
        provider.token
      )
    ) {
      throw new Error(
        `Provider already registered: ${String(provider.token)}`
      );
    }

    const hasValue =
      provider.useValue !== undefined;

    const hasFactory =
      provider.useFactory !== undefined;

    if (
      hasValue === hasFactory
    ) {
      throw new Error(
        `Provider ${String(provider.token)} must define exactly one of useValue or useFactory`
      );
    }

    const definition:
      ProviderDefinition<T> = {
      lifetime:
        provider.lifetime ??
        "singleton"
    };

    if (hasValue) {
      definition.useValue =
        provider.useValue as T;
    }

    if (hasFactory) {
      definition.useFactory =
        provider.useFactory as () => T;
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

    if (!provider) {
      throw new Error(
        `Provider not found: ${String(token)}`
      );
    }

    if (
      provider.useValue !==
      undefined
    ) {
      return provider.useValue as T;
    }

    if (
      provider.lifetime ===
        "singleton" &&
      provider.instance !==
        undefined
    ) {
      return provider.instance as T;
    }

    if (
      !provider.useFactory
    ) {
      throw new Error(
        `Provider ${String(token)} has no factory`
      );
    }

    const instance =
      provider.useFactory();

    if (
      provider.lifetime ===
      "singleton"
    ) {
      provider.instance =
        instance;
    }

    return instance as T;
  }

  has(
    token: ProviderToken
  ): boolean {
    return this.providers.has(
      token
    );
  }

  clear(): void {
    this.providers.clear();
  }
}