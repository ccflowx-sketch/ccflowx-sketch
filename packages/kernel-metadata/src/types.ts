export interface MetadataDefinition {
  id: string;
  type: string;
  version: string;
  name: string;
  description?: string;
  tags?: string[];
}