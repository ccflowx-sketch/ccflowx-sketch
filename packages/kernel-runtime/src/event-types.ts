import { RuntimeEvents } from "./runtime-events.js";
type RuntimeState =
  | "created"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "failed";

export interface RuntimeEventMap {
  [RuntimeEvents.Starting]: {
    runtimeId: string;
    state: RuntimeState;
  };

  [RuntimeEvents.Started]: {
    runtimeId: string;
    state: RuntimeState;
  };

  [RuntimeEvents.Stopping]: {
    runtimeId: string;
    state: RuntimeState;
  };

  [RuntimeEvents.Stopped]: {
    runtimeId: string;
    state: RuntimeState;
  };

  [RuntimeEvents.Failed]: {
    runtimeId: string;
    state: RuntimeState;
    error: unknown;
  };

  [RuntimeEvents.ModuleRegistered]: {
    runtimeId: string;
    module: string;
    version: string;
  };

  [RuntimeEvents.ModuleUnregistered]: {
    runtimeId: string;
    module: string;
  };

  // Required so RuntimeEventMap satisfies Record<PropertyKey, unknown>
  [key: string]: unknown;
}