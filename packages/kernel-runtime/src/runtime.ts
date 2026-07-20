import type { PlatformModule } from "@ccflowx/kernel-contracts";
import { Registry } from "@ccflowx/kernel-registry";
import { MetadataRegistry } from "@ccflowx/kernel-metadata";

import { DependencyContainer } from "./container.js";
import { EventBus } from "./event-bus.js";

export class PlatformRuntime {
  private readonly container = new DependencyContainer();
  private readonly registry = new Registry();
  private readonly metadata = new MetadataRegistry();
  private readonly eventBus = new EventBus();
  private readonly modules: PlatformModule[] = [];

  registerModule(module: PlatformModule): void {
    this.modules.push(module);

    void this.eventBus.publish({
      type: "runtime.module.registered",
      timestamp: new Date(),
      payload: {
        module: module.constructor.name
      }
    });
  }

  getContainer(): DependencyContainer {
    return this.container;
  }

  register<T>(
    token: string | symbol,
    value: T
  ): void {
    this.container.register({
      token,
      useValue: value
    });
  }

  resolve<T>(
    token: string | symbol
  ): T {
    return this.container.resolve<T>(token);
  }

  getRegistry(): Registry {
    return this.registry;
  }

  getMetadataRegistry(): MetadataRegistry {
    return this.metadata;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  async start(): Promise<void> {
    await this.eventBus.publish({
      type: "runtime.starting",
      timestamp: new Date(),
      payload: {}
    });

    for (const module of this.modules) {
      await module.initialize();
    }

    await this.eventBus.publish({
      type: "runtime.started",
      timestamp: new Date(),
      payload: {}
    });
  }

  async shutdown(): Promise<void> {
    await this.eventBus.publish({
      type: "runtime.stopping",
      timestamp: new Date(),
      payload: {}
    });

    for (const module of [...this.modules].reverse()) {
      await module.shutdown();
    }

    await this.eventBus.publish({
      type: "runtime.stopped",
      timestamp: new Date(),
      payload: {}
    });
  }
}