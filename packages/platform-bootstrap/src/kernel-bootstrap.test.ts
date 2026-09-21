import { describe, expect, it } from "vitest";

import { KernelBootstrap } from "./kernel-bootstrap.js";

describe("KernelBootstrap", () => {
  it("creates a runtime through KernelBoot", () => {
    const bootstrap = new KernelBootstrap();

    const runtime = bootstrap.getRuntime();

    expect(runtime).toBeDefined();
    expect(runtime.isCreated()).toBe(true);
  });

  it("boots the capability runtime and platform runtime", async () => {
    const bootstrap = new KernelBootstrap();

    const runtime = await bootstrap.boot();

    expect(runtime.isRunning()).toBe(true);
  });

  it("returns the same runtime instance after boot", async () => {
    const bootstrap = new KernelBootstrap();

    const before = bootstrap.getRuntime();
    const after = await bootstrap.boot();

    expect(after).toBe(before);
  });

  it("shuts down the platform runtime", async () => {
    const bootstrap = new KernelBootstrap();

    await bootstrap.boot();
    await bootstrap.shutdown();

    expect(
      bootstrap.getRuntime().isStopped()
    ).toBe(true);
  });
});