import type { PlatformModule } from "@ccflowx/kernel-contracts";

import { CapabilityRuntime } from "./capability-runtime.js";
import { PlatformRuntime } from "./runtime.js";

export interface KernelBootOptions {
  readonly modules?: readonly PlatformModule[];
}

export class KernelBoot {
  private readonly runtime: PlatformRuntime;
  private readonly capabilities: CapabilityRuntime;

  constructor(
    options: KernelBootOptions = {}
  ) {
    this.runtime = new PlatformRuntime();
    this.capabilities = new CapabilityRuntime();

    for (const module of options.modules ?? []) {
      this.runtime.registerModule(module);
    }
  }

  getRuntime(): PlatformRuntime {
    return this.runtime;
  }

  getCapabilityRuntime(): CapabilityRuntime {
    return this.capabilities;
  }

  async start(): Promise<PlatformRuntime> {
    await this.capabilities.initialize();
    await this.runtime.start();

    return this.runtime;
  }

  async shutdown(): Promise<void> {
    await this.runtime.shutdown();
    await this.capabilities.shutdown();
  }
}