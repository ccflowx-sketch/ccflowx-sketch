import type { PlatformModule } from "@ccflowx/kernel-contracts";

export interface ModuleDependencyMetadata {
  readonly dependencies?: readonly string[];
  readonly optionalDependencies?: readonly string[];
}

export type DependencyAwareModule =
  PlatformModule &
  ModuleDependencyMetadata;

export function isDependencyAwareModule(
  module: PlatformModule
): module is DependencyAwareModule {
  return (
    "dependencies" in module ||
    "optionalDependencies" in module
  );
}