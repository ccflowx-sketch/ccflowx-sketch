export const RuntimeEvents = {
  Starting: "runtime.starting",
  Started: "runtime.started",
  Stopping: "runtime.stopping",
  Stopped: "runtime.stopped",
  Failed: "runtime.failed",
  ModuleRegistered: "runtime.module.registered",
  ModuleUnregistered: "runtime.module.unregistered",
} as const;