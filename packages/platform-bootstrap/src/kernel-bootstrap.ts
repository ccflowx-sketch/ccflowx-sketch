import {
  PlatformRuntime,
  CapabilityRuntime
} from "@ccflowx/kernel-runtime";

export class KernelBootstrap {
  private readonly runtime =
    new PlatformRuntime();

  private readonly capabilities =
    new CapabilityRuntime();

  getRuntime(): PlatformRuntime {
    return this.runtime;
  }

  getCapabilityRuntime(): CapabilityRuntime {
    return this.capabilities;
  }

  async boot(): Promise<void> {
    await this.capabilities.initialize();
    await this.runtime.start();
  }

  async shutdown(): Promise<void> {
    await this.runtime.shutdown();
    await this.capabilities.shutdown();
  }
}