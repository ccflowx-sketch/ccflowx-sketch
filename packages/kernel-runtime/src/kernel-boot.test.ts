import { describe, expect, it } from "vitest";

import { KernelBoot } from "./kernel-boot.js";

describe("KernelBoot", () => {
  it("creates a platform runtime", () => {
    const boot = new KernelBoot();

    expect(boot.getRuntime()).toBeDefined();
  });

  it("registers modules before startup", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "test-module",
          version: "1.0.0",
          initialize: async () => {
            events.push("init");
          },
          shutdown: async () => {}
        }
      ]
    });

    await boot.start();

    expect(events).toEqual(["init"]);
  });

  it("starts the runtime", async () => {
    const boot = new KernelBoot();

    const runtime = await boot.start();

    expect(runtime).toBe(boot.getRuntime());
  });

  it("shuts down the runtime", async () => {
    const boot = new KernelBoot();

    await boot.start();
    await expect(boot.shutdown()).resolves.toBeUndefined();
  });

  it("initializes registered modules during startup", async () => {
    let initialized = false;

    const boot = new KernelBoot({
      modules: [
        {
          name: "test-module",
          version: "1.0.0",
          initialize: async () => {
            initialized = true;
          },
          shutdown: async () => {}
        }
      ]
    });

    await boot.start();

    expect(initialized).toBe(true);
  });

  it("initializes capabilities before runtime modules", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "test-module",
          version: "1.0.0",
          initialize: async () => {
            events.push("module:init");
          },
          shutdown: async () => {}
        }
      ]
    });

    boot.getCapabilityRuntime().register({
      name: "test-capability",
      version: "1.0.0",
      manifest: {
        id: "test-capability",
        name: "Test Capability",
        version: "1.0.0"
      },
      initialize: async () => {
        events.push("capability:init");
      },
      shutdown: async () => {}
    });

    await boot.start();

    expect(events).toEqual([
      "capability:init",
      "module:init"
    ]);
  });

  it("shuts down runtime modules before capabilities", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "test-module",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {
            events.push("module:shutdown");
          }
        }
      ]
    });

    boot.getCapabilityRuntime().register({
      name: "test-capability",
      version: "1.0.0",
      manifest: {
        id: "test-capability",
        name: "Test Capability",
        version: "1.0.0"
      },
      initialize: async () => {},
      shutdown: async () => {
        events.push("capability:shutdown");
      }
    });

    await boot.start();
    await boot.shutdown();

    expect(events).toEqual([
      "module:shutdown",
      "capability:shutdown"
    ]);
  });
});