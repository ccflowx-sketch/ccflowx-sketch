import type { PlatformModule } from "@ccflowx/kernel-contracts";

export class ModuleLoader {
  private readonly modules: PlatformModule[] = [];

  register(
    module: PlatformModule
  ): void {
    this.modules.push(module);
  }

  getModules(): readonly PlatformModule[] {
    return this.modules;
  }

  async initializeAll(): Promise<void> {
    for (const module of this.modules) {
      await module.initialize();
    }
  }

  async shutdownAll(): Promise<void> {
    for (const module of [...this.modules].reverse()) {
      await module.shutdown();
    }
  }

  clear(): void {
    this.modules.length = 0;
  }
}