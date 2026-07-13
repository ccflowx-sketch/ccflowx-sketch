export class DependencyContainer {
  private readonly registry = new Map<string, unknown>();

  register<T>(key: string, value: T): void {
    this.registry.set(key, value);
  }

  resolve<T>(key: string): T {
    const dependency = this.registry.get(key);

    if (!dependency) {
      throw new Error(`Dependency not found: ${key}`);
    }

    return dependency as T;
  }

  has(key: string): boolean {
    return this.registry.has(key);
  }
}