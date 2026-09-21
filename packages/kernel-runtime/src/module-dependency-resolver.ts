import type { PlatformModule } from "@ccflowx/kernel-contracts";
import {
  isDependencyAwareModule,
  type DependencyAwareModule
} from "./module-dependency.js";

export class ModuleDependencyResolver {
  resolveOrder(
    modules: readonly PlatformModule[]
  ): PlatformModule[] {
    const resolved: PlatformModule[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const map = new Map<string, PlatformModule>();

    for (const module of modules) {
      if (map.has(module.name)) {
        throw new Error(
          `Duplicate module dependency identity: ${module.name}`
        );
      }

      map.set(module.name, module);
    }

    const visit = (module: PlatformModule): void => {
      const name = module.name;

      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new Error(
          `Module dependency cycle detected: ${name}`
        );
      }

      visiting.add(name);

      const dependencyMetadata =
        isDependencyAwareModule(module)
          ? module
          : undefined;

      for (
        const dependency of
        dependencyMetadata?.dependencies ?? []
      ) {
        const dependencyModule = map.get(dependency);

        if (!dependencyModule) {
          throw new Error(
            `Missing module dependency: ${dependency}`
          );
        }

        visit(dependencyModule);
      }

      visiting.delete(name);
      visited.add(name);
      resolved.push(module);
    };

    for (const module of modules) {
      visit(module);
    }

    return resolved;
  }
}