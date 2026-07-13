export interface RegistryEntry {
  name: string;
  version: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export class PlatformRegistry {
  private readonly entries = new Map<string, RegistryEntry>();

  register(entry: RegistryEntry): void {
    if (this.entries.has(entry.name)) {
      throw new Error(`Registry entry already exists: ${entry.name}`);
    }

    this.entries.set(entry.name, entry);
  }

  get(name: string): RegistryEntry | undefined {
    return this.entries.get(name);
  }

  list(): RegistryEntry[] {
    return Array.from(this.entries.values());
  }

  has(name: string): boolean {
    return this.entries.has(name);
  }
}