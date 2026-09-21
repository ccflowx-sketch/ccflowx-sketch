import { describe, expect, it } from "vitest";
import type { DependencyAwareModule } from "./module-dependency.js";
import { PlatformRuntime } from "./runtime.js";

function createModule(
  name: string,
  dependencies: readonly string[],
  events: string[]
): DependencyAwareModule {
  return {
    name,
    version: "1.0.0",
    dependencies,
    initialize: async () => {
      events.push(`init:${name}`);
    },
    shutdown: async () => {
      events.push(`shutdown:${name}`);
    }
  };
}

describe("PlatformRuntime module dependencies", () => {
  it("initializes modules in dependency order", async () => {
    const runtime = new PlatformRuntime();
    const events: string[] = [];

    runtime.registerModule(
      createModule("module-c", ["module-b"], events)
    );

    runtime.registerModule(
      createModule("module-b", ["module-a"], events)
    );

    runtime.registerModule(
      createModule("module-a", [], events)
    );

    await runtime.start();

    expect(events).toEqual([
      "init:module-a",
      "init:module-b",
      "init:module-c"
    ]);
  });

  it("shuts down modules in reverse dependency order", async () => {
    const runtime = new PlatformRuntime();
    const events: string[] = [];

    runtime.registerModule(
      createModule("module-c", ["module-b"], events)
    );

    runtime.registerModule(
      createModule("module-b", ["module-a"], events)
    );

    runtime.registerModule(
      createModule("module-a", [], events)
    );

    await runtime.start();
    events.length = 0;

    await runtime.shutdown();

    expect(events).toEqual([
      "shutdown:module-c",
      "shutdown:module-b",
      "shutdown:module-a"
    ]);
  });

  it("rejects startup when a module dependency is missing", async () => {
    const runtime = new PlatformRuntime();

    runtime.registerModule(
      createModule(
        "module-b",
        ["missing-module"],
        []
      )
    );

    await expect(runtime.start()).rejects.toThrow(
      "Missing module dependency: missing-module"
    );

    expect(runtime.isFailed()).toBe(true);
  });

  it("rejects startup when module dependencies form a cycle", async () => {
    const runtime = new PlatformRuntime();

    runtime.registerModule(
      createModule("module-a", ["module-b"], [])
    );

    runtime.registerModule(
      createModule("module-b", ["module-a"], [])
    );

    await expect(runtime.start()).rejects.toThrow(
      "Module dependency cycle detected: module-a"
    );

    expect(runtime.isFailed()).toBe(true);
  });
});