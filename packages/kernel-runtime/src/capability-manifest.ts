export interface CapabilityManifest {
  id: string;
  name: string;
  version: string;
  description?: string;

  dependencies?: readonly string[];

  optionalDependencies?: readonly string[];

  tags?: readonly string[];


  enabledByDefault?: boolean;
}