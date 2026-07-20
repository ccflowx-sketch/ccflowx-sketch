import type { MetadataDefinition } from "./types.js";

export class MetadataRegistry {
  private readonly definitions = new Map<string, MetadataDefinition>();

  register(definition: MetadataDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw new Error(
        `Metadata '${definition.id}' is already registered.`
      );
    }

    this.definitions.set(definition.id, definition);
  }

  get(id: string): MetadataDefinition | undefined {
    return this.definitions.get(id);
  }

  has(id: string): boolean {
    return this.definitions.has(id);
  }

  list(): MetadataDefinition[] {
    return [...this.definitions.values()];
  }

  remove(id: string): boolean {
    return this.definitions.delete(id);
  }

  clear(): void {
    this.definitions.clear();
  }
}