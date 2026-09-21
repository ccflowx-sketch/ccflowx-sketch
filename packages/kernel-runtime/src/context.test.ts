import { describe, expect, it } from "vitest";

import {
  DefaultRuntimeContext
} from "./context.js";

import {
  DependencyContainer
} from "./container.js";

describe("DefaultRuntimeContext", () => {
  it("creates a context with runtime metadata", () => {
    const container = new DependencyContainer();

    const context = new DefaultRuntimeContext(
      "runtime-1",
      container,
      "correlation-1"
    );

    expect(context.runtimeId).toBe("runtime-1");
    expect(context.correlationId).toBe("correlation-1");
    expect(context.createdAt).toBeInstanceOf(Date);
  });

  it("generates a correlation id when none is provided", () => {
    const container = new DependencyContainer();

    const context = new DefaultRuntimeContext(
      "runtime-1",
      container
    );

    expect(context.correlationId).toEqual(
      expect.any(String)
    );

    expect(context.correlationId.length).toBeGreaterThan(0);
  });

  it("resolves dependencies through the runtime container", () => {
    const container = new DependencyContainer();

    const service = {
      name: "test-service"
    };

    container.register({
      token: "test-service",
      useValue: service
    });

    const context = new DefaultRuntimeContext(
      "runtime-1",
      container
    );

    expect(
      context.resolve<typeof service>("test-service")
    ).toBe(service);
  });
});