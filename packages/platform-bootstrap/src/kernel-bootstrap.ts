import type {
  PlatformModule
} from "@ccflowx/kernel-contracts";

import {
  KernelBoot,
  PlatformRuntime
} from "@ccflowx/kernel-runtime";

import type {
  Capability
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
    this.kernelBoot = new KernelBoot(options);
  }

  getRuntime(): PlatformRuntime {
    return this.kernelBoot.getRuntime();
  }

  getCapabilityRuntime() {
    return this.kernelBoot.getCapabilityRuntime();
  }

  async boot(): Promise<PlatformRuntime> {
    return this.kernelBoot.start();
  }

  async shutdown(): Promise<void> {
    await this.kernelBoot.shutdown();
  }
}