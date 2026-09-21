import type { PlatformModule } from "@ccflowx/kernel-contracts";

import { PlatformRuntime } from "./runtime.js";

export interface KernelBootOptions {
  readonly modules?: readonly PlatformModule[];
}

export class KernelBoot {
  private readonly runtime: PlatformRuntime;

  constructor(
    options: KernelBootOptions = {}
  ) {
    this.runtime = new PlatformRuntime();

    for (const module of options.modules ?? []) {
      this.runtime.registerModule(module);
    }
  }

  getRuntime(): PlatformRuntime {
    return this.runtime;
  }

  async start(): Promise<PlatformRuntime> {
    await this.runtime.start();

    return this.runtime;
  }

  async shutdown(): Promise<void> {
    await this.runtime.shutdown();
  }
}