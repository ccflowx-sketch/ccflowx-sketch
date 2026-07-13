import type { PlatformModule } from "@ccflowx/kernel-contracts";
import { DependencyContainer } from "./container.js";

export class PlatformRuntime {
  private readonly container = new DependencyContainer();
  private readonly modules: PlatformModule[] = [];

  registerModule(module: PlatformModule): void {
    this.modules.push(module);
  }

  getContainer(): DependencyContainer {
    return this.container;
  }

  async start(): Promise<void> {
    for (const module of this.modules) {
      await module.initialize();
    }
  }

  async shutdown(): Promise<void> {
    for (const module of [...this.modules].reverse()) {
      await module.shutdown();
    }
  }
}