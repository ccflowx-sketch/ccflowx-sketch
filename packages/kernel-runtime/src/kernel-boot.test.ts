import { describe, expect, it } from "vitest";

import type {
  PlatformModule
} from "@ccflowx/kernel-contracts";

import type { Capability } from "./capability.js";
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

    await expect(
      boot.shutdown()
    ).resolves.toBeUndefined();
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

  it("rolls back initialized modules when a later module fails", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "module-a",
          version: "1.0.0",
          initialize: async () => {
            events.push("a:init");
          },
          shutdown: async () => {
            events.push("a:shutdown");
          }
        },
        {
          name: "module-b",
          version: "1.0.0",
          initialize: async () => {
            events.push("b:init");
          },
          shutdown: async () => {
            events.push("b:shutdown");
          }
        },
        {
          name: "module-c",
          version: "1.0.0",
          initialize: async () => {
            events.push("c:init");

            throw new Error(
              "module-c initialization failed"
            );
          },
          shutdown: async () => {
            events.push("c:shutdown");
          }
        },
        {
          name: "module-d",
          version: "1.0.0",
          initialize: async () => {
            events.push("d:init");
          },
          shutdown: async () => {
            events.push("d:shutdown");
          }
        }
      ]
    });

    await expect(
      boot.start()
    ).rejects.toThrow(
      "module-c initialization failed"
    );

    expect(events).toEqual([
      "a:init",
      "b:init",
      "c:init",
      "b:shutdown",
      "a:shutdown"
    ]);

    expect(
      boot.getRuntime().isFailed()
    ).toBe(true);
  });

  it("does not start platform modules when capability initialization fails", async () => {
    const events: string[] = [];

    const failingCapability: Capability = {
      manifest: {
        id: "failing-capability",
        name: "Failing Capability",
        version: "1.0.0"
      },
      name: "failing-capability",
      version: "1.0.0",
      initialize: async () => {
        events.push("capability:init");

        throw new Error(
          "capability initialization failed"
        );
      },
      shutdown: async () => {
        events.push("capability:shutdown");
      }
    };

    const module: PlatformModule = {
      name: "platform-module",
      version: "1.0.0",
      initialize: async () => {
        events.push("module:init");
      },
      shutdown: async () => {
        events.push("module:shutdown");
      }
    };

    const boot = new KernelBoot({
      capabilities: [failingCapability],
      modules: [module]
    });

    await expect(
      boot.start()
    ).rejects.toThrow(
      "capability initialization failed"
    );

    expect(events).toEqual([
      "capability:init"
    ]);
  });

  it("initializes capabilities before starting the platform runtime", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
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

    await boot.start();

    expect(events).toEqual([
      "capability:init",
      "module:init"
    ]);
  });

  it("shuts down the platform runtime before capabilities", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      capabilities: [
        {
          manifest: {
            id: "test-capability",
            name: "Test Capability",
            version: "1.0.0"
          },
          name: "test-capability",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {
            events.push("capability:shutdown");
          }
        }
      ],
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

    await boot.start();
    await boot.shutdown();

    expect(events).toEqual([
      "module:shutdown",
      "capability:shutdown"
    ]);
  });
});