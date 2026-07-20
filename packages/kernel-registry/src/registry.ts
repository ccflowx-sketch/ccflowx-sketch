export interface Registration<T = unknown> {
  id: string;
  type: string;
  value: T;
}

export class Registry {
  private readonly registrations = new Map<string, Registration>();

  register<T>(registration: Registration<T>): void {
    if (this.registrations.has(registration.id)) {
      throw new Error(`Registration '${registration.id}' already exists.`);
    }

    this.registrations.set(registration.id, registration);
  }

  resolve<T>(id: string): T {
    const registration = this.registrations.get(id);

    if (!registration) {
      throw new Error(`Registration '${id}' not found.`);
    }

    return registration.value as T;
  }

  has(id: string): boolean {
    return this.registrations.has(id);
  }

  list(): Registration[] {
    return [...this.registrations.values()];
  }

  clear(): void {
    this.registrations.clear();
  }
}