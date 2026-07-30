export interface Registration<T = unknown> {
  id: string;
  type: string;
  value: T;
}

export class Registry {
  private readonly registrations =
    new Map<string, Registration>();

  register<T>(
    registration: Registration<T>
  ): void {
    if (this.registrations.has(registration.id)) {
      throw new Error(
        `Registration '${registration.id}' already exists.`
      );
    }

    this.registrations.set(
      registration.id,
      registration
    );
  }

  resolve<T>(id: string): T {
    const registration =
      this.registrations.get(id);

    if (!registration) {
      throw new Error(
        `Registration '${id}' not found.`
      );
    }

    return registration.value as T;
  }

  get<T>(id: string): T | undefined {
    return this.registrations.get(id)?.value as
      | T
      | undefined;
  }

  has(id: string): boolean {
    return this.registrations.has(id);
  }

  remove(id: string): boolean {
    return this.registrations.delete(id);
  }

  list(): readonly string[] {
    return [...this.registrations.keys()];
  }

  clear(): void {
    this.registrations.clear();
  }
}