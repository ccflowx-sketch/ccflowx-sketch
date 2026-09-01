import { describe, expect, it } from "vitest";

import { DependencyContainer } from "./container.js";

describe("DependencyContainer", () => {
  it("resolves a value provider", () => {
    const container = new DependencyContainer();

    container.register({
      token: "config",
      useValue: { enabled: true }
    });

    expect(
      container.resolve<{ enabled: boolean }>("config")
    ).toEqual({ enabled: true });
  });

  it("resolves a singleton factory", () => {
    const container = new DependencyContainer();

    let calls = 0;

    container.register({
      token: "service",
      useFactory: () => {
        calls++;
        return {};
      },
      lifetime: "singleton"
    });

    const first = container.resolve("service");
    const second = container.resolve("service");

    expect(first).toBe(second);
    expect(calls).toBe(1);
  });

  it("resolves a transient factory", () => {
    const container = new DependencyContainer();

    container.register({
      token: "service",
      useFactory: () => ({}),
      lifetime: "transient"
    });

    const first = container.resolve("service");
    const second = container.resolve("service");

    expect(first).not.toBe(second);
  });

  it("rejects duplicate providers", () => {
    const container = new DependencyContainer();

    container.register({
      token: "service",
      useValue: {}
    });

    expect(() =>
      container.register({
        token: "service",
        useValue: {}
      })
    ).toThrow("Provider already registered");
  });

  it("rejects missing providers", () => {
    const container = new DependencyContainer();

    expect(() =>
      container.resolve("missing")
    ).toThrow("Service not found");
  });

  it("detects circular dependencies", () => {
    const container = new DependencyContainer();

    container.register({
      token: "a",
      useFactory: () =>
        container.resolveWithStack("b", ["a"])
    });

    container.register({
      token: "b",
      useFactory: () =>
        container.resolveWithStack("a", ["a", "b"])
    });

    expect(() =>
      container.resolveWithStack("a")
    ).toThrow("Circular dependency detected");
  });
});