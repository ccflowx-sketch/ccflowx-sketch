export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
}

export interface EntityDefinition {
  name: string;
  label: string;
  fields: FieldDefinition[];
}

export interface CapabilityDefinition {
  name: string;
  version: string;
  description: string;
  entities: EntityDefinition[];
}

export class MetadataCatalog {
  private readonly capabilities = new Map<
    string,
    CapabilityDefinition
  >();

  registerCapability(
    capability: CapabilityDefinition
  ): void {
    this.capabilities.set(
      capability.name,
      capability
    );
  }

  getCapability(
    name: string
  ): CapabilityDefinition | undefined {
    return this.capabilities.get(name);
  }

  listCapabilities(): CapabilityDefinition[] {
    return Array.from(
      this.capabilities.values()
    );
  }
}