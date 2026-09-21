import { describe, expect, it } from "vitest";

import {
  KernelBoot
} from "./kernel-boot.js";

describe("KernelBoot", () => {
  it("creates a platform runtime", () => {
    const boot = new KernelBoot();

    expect(
      boot.getRuntime()
    ).toBeDefined();

    expect(
      boot.getRuntime().isCreated()
    ).toBe(true);
  });

  it("registers modules before startup", () => {
    const boot = new KernelBoot({
      modules: [
        {
          name: "test-module",
          version: "1.0.0",
          initialize: async () => {},
          shutdown: async () => {}
        }
      ]
    });

    expect(
      boot.getRuntime().getModuleCount()
    ).toBe(1);
  });

  it("starts the runtime", async () => {
    const boot = new KernelBoot();

    const runtime = await boot.start();

    expect(
      runtime.isRunning()
    ).toBe(true);
  });

  it("shuts down the runtime", async () => {
    const boot = new KernelBoot();

    await boot.start();
    await boot.shutdown();

    expect(
      boot.getRuntime().isStopped()
    ).toBe(true);
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
});