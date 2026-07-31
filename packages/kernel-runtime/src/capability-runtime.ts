import type { Capability } from "./capability.js";
import { CapabilityResolver } from "./capability-resolver.js";

export class CapabilityRuntime {
  private readonly resolver =
    new CapabilityResolver();

  private capabilities: Capability[] = [];

  register(
    capability: Capability
  ): void {
    this.capabilities.push(capability);
  }

  getCapabilities(): readonly Capability[] {
    return this.capabilities;
  }

  async initialize(): Promise<void> {
    const ordered =
      this.resolver.resolveOrder(
        this.capabilities
      );

    for (const capability of ordered) {
      await capability.initialize();
    }
  }

  async shutdown(): Promise<void> {
    const ordered =
      this.resolver.resolveOrder(
        this.capabilities
      );

    for (const capability of [...ordered].reverse()) {
      await capability.shutdown();
    }
  }

  clear(): void {
    this.capabilities = [];
  }
}