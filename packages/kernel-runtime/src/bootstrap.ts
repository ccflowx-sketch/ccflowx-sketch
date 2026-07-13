import { PlatformRuntime } from "./runtime.js";

export async function bootstrapPlatform(): Promise<PlatformRuntime> {
  const runtime = new PlatformRuntime();

  await runtime.start();

  return runtime;
}