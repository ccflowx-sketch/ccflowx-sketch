import type { PlatformModule } from "@ccflowx/kernel-contracts";

import type { CapabilityManifest } from "./capability-manifest.js";

export interface Capability
  extends PlatformModule {

  readonly manifest: CapabilityManifest;
}
