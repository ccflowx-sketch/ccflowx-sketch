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
  private readonly capabilities: CapabilityRuntime;

  constructor(options: KernelBootstrapOptions = {}) {
    this.kernelBoot =
      options.modules
        ? new KernelBoot({
            modules: options.modules
          })
        : new KernelBoot();

    this.capabilities =
      new CapabilityRuntime();

    for (
      const capability of
      options.capabilities ?? []
    ) {
      this.capabilities.register(
        capability
      );
    }
  }

  getRuntime(): PlatformRuntime {
    return this.kernelBoot.getRuntime();
  }

  getCapabilityRuntime(): CapabilityRuntime {
    return this.capabilities;
  }

  async boot(): Promise<PlatformRuntime> {
    await this.capabilities.initialize();
    await this.kernelBoot.start();

    return this.kernelBoot.getRuntime();
  }

  async shutdown(): Promise<void> {
    await this.kernelBoot.shutdown();
    await this.capabilities.shutdown();
  }
}