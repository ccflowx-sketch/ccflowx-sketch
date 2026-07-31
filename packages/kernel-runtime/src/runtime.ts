import type { PlatformModule } from "@ccflowx/kernel-contracts";
import { Registry } from "@ccflowx/kernel-registry";
import { MetadataRegistry } from "@ccflowx/kernel-metadata";
import { randomUUID } from "node:crypto";

import { DependencyContainer } from "./container.js";
import { EventBus } from "./event-bus.js";
import { RuntimeEvents } from "./runtime-events.js";

import type { RuntimeHealth } from "./runtime-health.js";

import type { RuntimeMetrics } from "./runtime-metrics.js";
import type { RuntimeSnapshot } from "./runtime-snapshot.js";

import type { RuntimeEventMap } from "./event-types.js";


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
  private startedAt?: Date;
  private stoppedAt?: Date;
  private lastError?: unknown;
  private startupStartedAt?: number;
  private shutdownStartedAt?: number;

  private readonly version = "0.1.0";

  private readonly container = new DependencyContainer();
  private readonly registry = new Registry();
  private readonly metadata = new MetadataRegistry();
  private readonly eventBus =
    new EventBus<RuntimeEventMap>();

  private readonly modules: PlatformModule[] = [];

  private state: RuntimeState = "created";

  private readonly metrics: RuntimeMetrics = {
    startCount: 0,
    stopCount: 0,
    failureCount: 0,
    registeredModules: 0,
    averageStartupTimeMs: 0,
    averageShutdownTimeMs: 0,
    lastStartupTimeMs: 0,
    lastShutdownTimeMs: 0
  };

  getState(): RuntimeState {
    return this.state;
  }

  getHealth(): RuntimeHealth {
    return {
      runtimeId: this.runtimeId,
      version: this.version,
      state: this.state,
      uptimeMs: Date.now() - this.createdAt.getTime(),
      moduleCount: this.modules.length,

      ...(this.startedAt !== undefined
        ? { startedAt: this.startedAt }
        : {}),

      ...(this.stoppedAt !== undefined
        ? { stoppedAt: this.stoppedAt }
        : {}),

      ...(this.lastError !== undefined
        ? { lastError: this.lastError }
        : {})
    };
  }

  getMetrics(): RuntimeMetrics {
    return {
      ...this.metrics
    };
  }

  getSnapshot(): RuntimeSnapshot {
    return {
      runtimeId: this.runtimeId,
      version: this.version,
      state: this.state,
      createdAt: this.createdAt,
      modules: this.modules.map(
        module => module.name
      ),
      metrics: this.getMetrics()
    };
  }

  isCreated(): boolean {
    return this.state === "created";
  }

  isRunning(): boolean {
    return this.state === "started";
  }

  isStopped(): boolean {
    return this.state === "stopped";
  }

  isFailed(): boolean {
    return this.state === "failed";
  }

  getModuleCount(): number {
    return this.modules.length;
  }

  getContainer(): DependencyContainer {
    return this.container;
  }

  getRuntimeId(): string {
    return this.runtimeId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getVersion(): string {
    return this.version;
  }

  registerModule(module: PlatformModule): void {
    if (
      this.modules.some(
        registeredModule => registeredModule.name === module.name
      )
    ) {
      throw new Error(
        `Module already registered: ${module.name}`
      );
    }

    this.modules.push(module);

    this.metrics.registeredModules++;

    void this.eventBus.publish({
      type: RuntimeEvents.ModuleRegistered,
      timestamp: new Date(),
      payload: {
        runtimeId: this.runtimeId,
        module: module.name,
        version: module.version
      }
    });
  }

  unregisterModule(name: string): boolean {
    const index = this.modules.findIndex(
      module => module.name === name
    );

    if (index === -1) {
      return false;
    }

    this.modules.splice(index, 1);

    this.metrics.registeredModules--;

    void this.eventBus.publish({
      type: RuntimeEvents.ModuleUnregistered,
      timestamp: new Date(),
      payload: {
        runtimeId: this.runtimeId,
        module: name
      }
    });

    return true;
  }

  getModule(
    name: string
  ): PlatformModule | undefined {
    return this.modules.find(
      module => module.name === name
    );
  }

  getModules(): readonly PlatformModule[] {
    return this.modules;
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

  getEventBus(): EventBus<RuntimeEventMap> {
    return this.eventBus;
  }

  async start(): Promise<void> {
    if (this.state !== "created") {
      throw new Error(
        `Runtime cannot start from state: ${this.state}`
      );
    }

    this.startupStartedAt = Date.now();
    this.state = "starting";

    await this.eventBus.publish({
      type: RuntimeEvents.Starting,
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
  this.startedAt = new Date();

  this.metrics.startCount++;

  const startupDuration =
    Date.now() - this.startupStartedAt!;

  this.metrics.lastStartupTimeMs =
    startupDuration;

  this.metrics.averageStartupTimeMs =
    (
      (this.metrics.averageStartupTimeMs *
        (this.metrics.startCount - 1)) +
      startupDuration
    ) / this.metrics.startCount;


      await this.eventBus.publish({
        type: RuntimeEvents.Started,
        timestamp: new Date(),
        payload: {
          runtimeId: this.runtimeId,
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";
      this.lastError = error;

      this.metrics.failureCount++;

      await this.eventBus.publish({
        type: RuntimeEvents.Failed,
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
    if (
      this.state !== "started" &&
      this.state !== "failed"
    ) {
      throw new Error(
        `Runtime cannot shutdown from state: ${this.state}`
      );
    }



    this.shutdownStartedAt = Date.now();
    this.state = "stopping";

    await this.eventBus.publish({
      type: RuntimeEvents.Stopping,
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
      const shutdownDuration =
        Date.now() - this.shutdownStartedAt!;

      this.metrics.lastShutdownTimeMs =
        shutdownDuration;

      this.metrics.stopCount++;

  this.metrics.averageShutdownTimeMs =
    (
      (this.metrics.averageShutdownTimeMs *
        (this.metrics.stopCount - 1)) +
      shutdownDuration
    ) / this.metrics.stopCount;

  this.stoppedAt = new Date();



      await this.eventBus.publish({
        type: RuntimeEvents.Stopped,
        timestamp: new Date(),
        payload: {
          runtimeId: this.runtimeId,
          state: this.state
        }
      });
    } catch (error) {
      this.state = "failed";
      this.lastError = error;
      this.metrics.failureCount++;

      await this.eventBus.publish({
        type: RuntimeEvents.Failed,
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

  reset(): void {
    if (
      this.state !== "stopped" &&
      this.state !== "failed"
    ) {
      throw new Error(
        `Runtime cannot reset from state: ${this.state}`
      );
    }

    this.modules.length = 0;
    this.container.clear();
    this.eventBus.clear();
    this.state = "created";
  }
}