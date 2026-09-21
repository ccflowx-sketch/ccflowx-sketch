import {
  CapabilityRuntime,
  KernelBoot,
  PlatformRuntime
} from "@ccflowx/kernel-runtime";

export class KernelBootstrap {
  private readonly kernelBoot =
    new KernelBoot();

  private readonly capabilities =
    new CapabilityRuntime();

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