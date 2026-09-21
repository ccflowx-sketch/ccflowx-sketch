import { describe, expect, it } from "vitest";
import type { PlatformModule } from "@ccflowx/kernel-contracts";

import {
  ModuleDependencyResolver,
  type DependencyAwareModule
} from "./index.js";

function module(
  name: string,
  dependencies: readonly string[] = []
): PlatformModule {
  const result: DependencyAwareModule = {
    name,
    version: "1.0.0",
    dependencies,
    initialize: async () => {},
    shutdown: async () => {}
  };

  return result;
}

describe("ModuleDependencyResolver", () => {
  it("resolves dependencies before dependents", () => {
    const resolver =
      new ModuleDependencyResolver();

    const modules = [
      module("A", ["B"]),
      module("B", ["C"]),
      module("C")
    ];

    const ordered =
      resolver.resolveOrder(modules);

    expect(
      ordered.map(module => module.name)
    ).toEqual(["C", "B", "A"]);
  });

  it("preserves registration order for independent modules", () => {
    const resolver =
      new ModuleDependencyResolver();

    const modules = [
      module("A"),
      module("B"),
      module("C")
    ];

    const ordered =
      resolver.resolveOrder(modules);

    expect(
      ordered.map(module => module.name)
    ).toEqual(["A", "B", "C"]);
  });

  it("detects missing dependencies", () => {
    const resolver =
      new ModuleDependencyResolver();

    expect(() =>
      resolver.resolveOrder([
        module("A", ["Missing"])
      ])
    ).toThrow(
      "Missing module dependency: Missing"
    );
  });

  it("detects dependency cycles", () => {
    const resolver =
      new ModuleDependencyResolver();

    expect(() =>
      resolver.resolveOrder([
        module("A", ["B"]),
        module("B", ["A"])
      ])
    ).toThrow(
      "Module dependency cycle detected"
    );
  });

  it("rejects duplicate module identities", () => {
    const resolver =
      new ModuleDependencyResolver();

    expect(() =>
      resolver.resolveOrder([
        module("A"),
        module("A")
      ])
    ).toThrow(
      "Duplicate module dependency identity: A"
    );
  });
});