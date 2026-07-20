import { PlatformRuntime } from "@ccflowx/kernel-runtime";

export class PlatformBootstrap {
  private readonly runtime: PlatformRuntime;

  constructor() {
    this.runtime = new PlatformRuntime();
  }

  async boot(): Promise<PlatformRuntime> {
    await this.runtime.start();

    return this.runtime;
  }

  async shutdown(): Promise<void> {
    await this.runtime.shutdown();
  }
}