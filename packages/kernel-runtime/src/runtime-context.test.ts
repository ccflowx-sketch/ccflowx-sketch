import { describe, expect, it } from "vitest";

import { PlatformRuntime } from "./runtime.js";

describe("PlatformRuntime runtime context", () => {
  it("creates a context bound to the runtime", () => {
    const runtime = new PlatformRuntime();

    const context = runtime.createContext(
      "correlation-1"
    );

    expect(context.runtimeId).toBe(
      runtime.getRuntimeId()
    );

    expect(context.correlationId).toBe(
      "correlation-1"
    );
  });

  it("creates unique correlation ids when none are provided", () => {
    const runtime = new PlatformRuntime();

    const first = runtime.createContext();
    const second = runtime.createContext();

    expect(first.correlationId).not.toBe(
      second.correlationId
    );
  });

  it("shares the runtime dependency container", () => {
    const runtime = new PlatformRuntime();

    const service = {
      name: "runtime-service"
    };

    runtime.register(
      "runtime-service",
      service
    );

    const context = runtime.createContext();

    expect(
      context.resolve<typeof service>(
        "runtime-service"
      )
    ).toBe(service);
  });
});