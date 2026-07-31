import type { Capability } from "./capability.js";

export class CapabilityResolver {
  resolveOrder(
    capabilities: readonly Capability[]
  ): Capability[] {
    const resolved: Capability[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const map =
      new Map(
        capabilities.map(
          capability => [
            capability.manifest.id,
            capability
          ]
        )
      );

    const visit = (
      capability: Capability
    ): void => {
      const id =
        capability.manifest.id;

      if (visited.has(id)) {
        return;
      }

      if (visiting.has(id)) {
        throw new Error(
          `Capability dependency cycle detected: ${id}`
        );
      }

      visiting.add(id);

      for (
        const dependency of
        capability.manifest.dependencies ?? []
      ) {
        const dependencyCapability =
          map.get(dependency);

        if (!dependencyCapability) {
          throw new Error(
            `Missing capability dependency: ${dependency}`
          );
        }

        visit(dependencyCapability);
      }

      visiting.delete(id);
      visited.add(id);
      resolved.push(capability);
    };

    for (const capability of capabilities) {
      visit(capability);
    }

    return resolved;
  }
}