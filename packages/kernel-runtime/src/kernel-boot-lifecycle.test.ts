import { describe, expect, it } from "vitest";

import { KernelBoot } from "./kernel-boot.js";

describe("KernelBoot module lifecycle", () => {
  it("initializes modules in registration order", async () => {
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
          },
          shutdown: async () => {
            events.push("c:shutdown");
          }
        }
      ]
    });

    await boot.start();

    expect(events).toEqual([
      "a:init",
      "b:init",
      "c:init"
    ]);
  });

  it("shuts modules down in reverse registration order", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "module-a",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {
            events.push("a:shutdown");
          }
        },
        {
          name: "module-b",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {
            events.push("b:shutdown");
          }
        },
        {
          name: "module-c",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {
            events.push("c:shutdown");
          }
        }
      ]
    });

    await boot.start();
    await boot.shutdown();

    expect(events).toEqual([
      "c:shutdown",
      "b:shutdown",
      "a:shutdown"
    ]);
  });

  it("does not initialize later modules when an earlier module fails", async () => {
    const events: string[] = [];

    const boot = new KernelBoot({
      modules: [
        {
          name: "module-a",
          version: "1.0.0",
          initialize: async () => {
            events.push("a:init");
          },
          shutdown: async () => {}
        },
        {
          name: "module-b",
          version: "1.0.0",
          initialize: async () => {
            events.push("b:init");
            throw new Error("module-b failed");
          },
          shutdown: async () => {}
        },
        {
          name: "module-c",
          version: "1.0.0",
          initialize: async () => {
            events.push("c:init");
          },
          shutdown: async () => {}
        }
      ]
    });

    await expect(
      boot.start()
    ).rejects.toThrow("module-b failed");

    expect(events).toEqual([
      "a:init",
      "b:init"
    ]);

    expect(
      boot.getRuntime().isFailed()
    ).toBe(true);
  });

  it("does not shut down when startup has not completed", async () => {
    const boot = new KernelBoot();

    await expect(
      boot.shutdown()
    ).rejects.toThrow(
      "Runtime cannot shutdown from state: created"
    );
  });
});