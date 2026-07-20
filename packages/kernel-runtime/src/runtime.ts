import type { PlatformModule } from "@ccflowx/kernel-contracts";
import { Registry } from "@ccflowx/kernel-registry";
import { MetadataRegistry } from "@ccflowx/kernel-metadata";

import { DependencyContainer } from "./container.js";
import { EventBus } from "./event-bus.js";

export type RuntimeState =
  | "created"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "failed";

export class PlatformRuntime {
  private readonly container = new DependencyContainer();
  private readonly registry = new Registry();
  private readonly metadata = new MetadataRegistry();
  private readonly eventBus = new EventBus();
  private readonly modules: PlatformModule[] = [];

  private state: RuntimeState = "created";

  registerModule(module: PlatformModule): void {
    if (this.state !== "created") {
      throw new Error(
        "Modules can only be registered before runtime start"
      );
    }

    this.modules.push(module);

    void this.eventBus.publish({
      type: "runtime.module.registered",
      timestamp: new Date(),
      payload: {
        module: module.name,
        version: module.version
      }
    });
  }

  getState(): RuntimeState {
    return this.state;
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
    if (this.state !== "created") {
      throw new Error(
        `Runtime cannot start from state: ${this.state}`
      );
    }

    this.state = "starting";

    await this.eventBus.publish({
      type: "runtime.starting",
      timestamp: new Date(),
      payload: {
        state: this.state
      }
    });

    try {
      for (const module of this.modules) {
        await module.initialize();
      }

      this.state = "started";

      await this.eventBus.publish({
        type: "runtime.started",
        timestamp: new Date(),
        payload: {
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";

      await this.eventBus.publish({
        type: "runtime.failed",
        timestamp: new Date(),
        payload: {
          state: this.state,
          error
        }
      });

      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.state !== "started") {
      throw new Error(
        `Runtime cannot shutdown from state: ${this.state}`
      );
    }

    this.state = "stopping";

    await this.eventBus.publish({
      type: "runtime.stopping",
      timestamp: new Date(),
      payload: {
        state: this.state
      }
    });

    try {
      for (const module of [...this.modules].reverse()) {
        await module.shutdown();
      }

      this.state = "stopped";

      await this.eventBus.publish({
        type: "runtime.stopped",
        timestamp: new Date(),
        payload: {
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";

      await this.eventBus.publish({
        type: "runtime.failed",
        timestamp: new Date(),
        payload: {
          state: this.state,
          error
        }
      });

      throw error;
    }
  }
}