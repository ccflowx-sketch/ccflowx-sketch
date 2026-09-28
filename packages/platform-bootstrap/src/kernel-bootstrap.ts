import type { PlatformModule } from "@ccflowx/kernel-contracts";

import {
  Capability,
  CapabilityRuntime,
  KernelBoot,
  PlatformRuntime
} from "@ccflowx/kernel-runtime";

export interface KernelBootstrapOptions {
  readonly modules?: readonly PlatformModule[];
  readonly capabilities?: readonly Capability[];
}

export class KernelBootstrap {
  private readonly kernelBoot: KernelBoot;

    constructor(
      options: KernelBootstrapOptions = {}
    ) {
      this.kernelBoot = new KernelBoot({
        ...(options.modules !== undefined
          ? { modules: options.modules }
          : {}),
        ...(options.capabilities !== undefined
          ? { capabilities: options.capabilities }
          : {})
      });
    }
  getRuntime(): PlatformRuntime {
    return this.kernelBoot.getRuntime();
  }

  getCapabilityRuntime(): CapabilityRuntime {
    return this.kernelBoot.getCapabilityRuntime();
  }

  async boot(): Promise<PlatformRuntime> {
    return this.kernelBoot.start();
  }

  async shutdown(): Promise<void> {
    await this.kernelBoot.shutdown();
  }
}