import type { PlatformModule } from "@ccflowx/kernel-contracts";
import { Registry } from "@ccflowx/kernel-registry";
import { MetadataRegistry } from "@ccflowx/kernel-metadata";
import { randomUUID } from "node:crypto";

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
  private readonly runtimeId = randomUUID();
  private readonly createdAt = new Date();

  private readonly container = new DependencyContainer();
  private readonly registry = new Registry();
  private readonly metadata = new MetadataRegistry();
  private readonly eventBus = new EventBus();
  private readonly modules: PlatformModule[] = [];

  private state: RuntimeState = "created";

  getState(): RuntimeState {
    return this.state;
  }

  getRuntimeId(): string {
    return this.runtimeId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  registerModule(module: PlatformModule): void {
    if (
      this.modules.some(
        (registeredModule) =>
          registeredModule.name === module.name
      )
    ) {
      throw new Error(
        `Module already registered: ${module.name}`
      );
    }

    this.modules.push(module);

    void this.eventBus.publish({
      type: "runtime.module.registered",
      timestamp: new Date(),
      payload: {
        runtimeId: this.runtimeId,
        module: module.name,
        version: module.version
      }
    });
  }
    getModule(
    name: string
  ): PlatformModule | undefined {
    return this.modules.find(
      (module) => module.name === name
    );
  }

  getModules(): readonly PlatformModule[] {
    return this.modules;
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
        runtimeId: this.runtimeId,
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
          runtimeId: this.runtimeId,
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";

      await this.eventBus.publish({
        type: "runtime.failed",
        timestamp: new Date(),
        payload: {
          runtimeId: this.runtimeId,
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
        runtimeId: this.runtimeId,
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
          runtimeId: this.runtimeId,
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";

      await this.eventBus.publish({
        type: "runtime.failed",
        timestamp: new Date(),
        payload: {
          runtimeId: this.runtimeId,
          state: this.state,
          error
        }
      });

      throw error;
    }
  }
}