import type { PlatformModule } from "@ccflowx/kernel-contracts";
import type { Capability } from "@ccflowx/kernel-runtime";

import { describe, expect, it } from "vitest";

import { KernelBootstrap } from "./kernel-bootstrap.js";

describe("KernelBootstrap", () => {
  it("creates a bootstrap instance with an empty kernel", () => {
    const bootstrap = new KernelBootstrap();

    expect(bootstrap.getRuntime()).toBeDefined();
    expect(bootstrap.getCapabilityRuntime()).toBeDefined();
  });

  it("registers supplied capabilities", () => {
    const capability: Capability = {
      manifest: {
        id: "test-capability",
        name: "Test Capability",
        version: "1.0.0"
      },
      name: "test-capability",
      version: "1.0.0",
      initialize: async () => {},
      shutdown: async () => {}
    };

    const bootstrap = new KernelBootstrap({
      capabilities: [capability]
    });

    expect(
      bootstrap.getCapabilityRuntime().getCapabilities()
    ).toHaveLength(1);

    expect(
      bootstrap.getCapabilityRuntime().getCapabilities()[0]
    ).toBe(capability);
  });

  it("registers supplied kernel modules", () => {
    const module: PlatformModule = {
      name: "test-module",
      version: "1.0.0",
      initialize: async () => {},
      shutdown: async () => {}
    };

    const bootstrap = new KernelBootstrap({
      modules: [module]
    });

    expect(
      bootstrap.getRuntime().getModules()
    ).toHaveLength(1);
  });

  it("boots the runtime", async () => {
    const bootstrap = new KernelBootstrap();

    const runtime = await bootstrap.boot();

    expect(runtime.getState()).toBe("started");
  });

  it("initializes capabilities before returning from boot", async () => {
    let initialized = false;

    const capability: Capability = {
      manifest: {
        id: "test-capability",
        name: "Test Capability",
        version: "1.0.0"
      },
      name: "test-capability",
      version: "1.0.0",
      initialize: async () => {
        initialized = true;
      },
      shutdown: async () => {}
    };

    const bootstrap = new KernelBootstrap({
      capabilities: [capability]
    });

    await bootstrap.boot();

    expect(initialized).toBe(true);
  });

  it("initializes kernel modules during boot", async () => {
    let initialized = false;

    const module: PlatformModule = {
      name: "test-module",
      version: "1.0.0",
      initialize: async () => {
        initialized = true;
      },
      shutdown: async () => {}
    };

    const bootstrap = new KernelBootstrap({
      modules: [module]
    });

    await bootstrap.boot();

    expect(initialized).toBe(true);
  });

  it("shuts down the runtime", async () => {
    const bootstrap = new KernelBootstrap();

    await bootstrap.boot();
    await bootstrap.shutdown();

    expect(
      bootstrap.getRuntime().getState()
    ).toBe("stopped");
  });

  it("shuts down capabilities and kernel modules", async () => {
    let capabilityShutdown = false;
    let moduleShutdown = false;

    const capability: Capability = {
      manifest: {
        id: "test-capability",
        name: "Test Capability",
        version: "1.0.0"
      },
      name: "test-capability",
      version: "1.0.0",
      initialize: async () => {},
      shutdown: async () => {
        capabilityShutdown = true;
      }
    };

    const module: PlatformModule = {
      name: "test-module",
      version: "1.0.0",
      initialize: async () => {},
      shutdown: async () => {
        moduleShutdown = true;
      }
    };

    const bootstrap = new KernelBootstrap({
      modules: [module],
      capabilities: [capability]
    });

    await bootstrap.boot();
    await bootstrap.shutdown();

    expect(moduleShutdown).toBe(true);
    expect(capabilityShutdown).toBe(true);
  });
});

it("initializes capabilities before runtime modules", async () => {
  const events: string[] = [];

  const boot = new KernelBootstrap({
    capabilities: [
      {
        manifest: {
          id: "test-capability",
          name: "Test Capability",
          version: "1.0.0"
        },
        name: "test-capability",
        version: "1.0.0",
        initialize: async () => {
          events.push("capability:init");
        },
        shutdown: async () => {
          events.push("capability:shutdown");
        }
      }
    ],
    modules: [
      {
        name: "test-module",
        version: "1.0.0",
        initialize: async () => {
          events.push("module:init");
        },
        shutdown: async () => {
          events.push("module:shutdown");
        }
      }
    ]
  });

  await boot.boot();

  expect(events).toEqual([
    "capability:init",
    "module:init"
  ]);

  await boot.shutdown();

  expect(events).toEqual([
    "capability:init",
    "module:init",
    "module:shutdown",
    "capability:shutdown"
  ]);
});