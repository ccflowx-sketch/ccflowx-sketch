import { describe, expect, it } from "vitest";

import { CapabilityRuntime } from "./capability-runtime.js";

describe("CapabilityRuntime", () => {
  it("initializes capabilities in dependency order", async () => {
    const events: string[] = [];

    const runtime = new CapabilityRuntime();

    runtime.register({
      name: "capability-b",
      version: "1.0.0",
      manifest: {
        id: "capability-b",
        version: "1.0.0",
        dependencies: ["capability-a"]
      },
      initialize: async () => {
        events.push("b:init");
      },
      shutdown: async () => {
        events.push("b:shutdown");
      }
    });

    runtime.register({
      name: "capability-a",
      version: "1.0.0",
      manifest: {
        id: "capability-a",
        version: "1.0.0"
      },
      initialize: async () => {
        events.push("a:init");
      },
      shutdown: async () => {
        events.push("a:shutdown");
      }
    });

    await runtime.initialize();

    expect(events).toEqual([
      "a:init",
      "b:init"
    ]);
  });

  it("shuts down capabilities in reverse dependency order", async () => {
    const events: string[] = [];

    const runtime = new CapabilityRuntime();

    runtime.register({
      name: "capability-b",
      version: "1.0.0",
      manifest: {
        id: "capability-b",
        version: "1.0.0",
        dependencies: ["capability-a"]
      },
      initialize: async () => {},
      shutdown: async () => {
        events.push("b:shutdown");
      }
    });

    runtime.register({
      name: "capability-a",
      version: "1.0.0",
      manifest: {
        id: "capability-a",
        version: "1.0.0"
      },
      initialize: async () => {},
      shutdown: async () => {
        events.push("a:shutdown");
      }
    });

    await runtime.initialize();
    await runtime.shutdown();

    expect(events).toEqual([
      "b:shutdown",
      "a:shutdown"
    ]);
  });

  it("rejects a missing capability dependency", async () => {
    const runtime = new CapabilityRuntime();

    runtime.register({
      name: "capability-b",
      version: "1.0.0",
      manifest: {
        id: "capability-b",
        version: "1.0.0",
        dependencies: ["missing-capability"]
      },
      initialize: async () => {},
      shutdown: async () => {}
    });

    await expect(
      runtime.initialize()
    ).rejects.toThrow(
      "Missing capability dependency: missing-capability"
    );
  });

  it("rejects a capability dependency cycle", async () => {
    const runtime = new CapabilityRuntime();

    runtime.register({
      name: "capability-a",
      version: "1.0.0",
      manifest: {
        id: "capability-a",
        version: "1.0.0",
        dependencies: ["capability-b"]
      },
      initialize: async () => {},
      shutdown: async () => {}
    });

    runtime.register({
      name: "capability-b",
      version: "1.0.0",
      manifest: {
        id: "capability-b",
        version: "1.0.0",
        dependencies: ["capability-a"]
      },
      initialize: async () => {},
      shutdown: async () => {}
    });

    await expect(
      runtime.initialize()
    ).rejects.toThrow(
      "Capability dependency cycle detected"
    );
  });

  it("clears registered capabilities", () => {
    const runtime = new CapabilityRuntime();

    runtime.register({
      name: "capability-a",
      version: "1.0.0",
      manifest: {
        id: "capability-a",
        version: "1.0.0"
      },
      initialize: async () => {},
      shutdown: async () => {}
    });

    expect(
      runtime.getCapabilities()
    ).toHaveLength(1);

    runtime.clear();

    expect(
      runtime.getCapabilities()
    ).toHaveLength(0);
  });
});