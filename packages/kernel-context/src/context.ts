import type { PlatformRuntime } from "@ccflowx/kernel-runtime";

export interface ExecutionContextOptions {
  tenantId: string;
  actorId: string;
  correlationId?: string;
  permissions?: string[];
  runtime: PlatformRuntime;
}

export class ExecutionContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly permissions: string[];
  readonly runtime: PlatformRuntime;

  constructor(options: ExecutionContextOptions) {
    this.tenantId = options.tenantId;

    this.actorId = options.actorId;

    this.correlationId =
      options.correlationId ?? crypto.randomUUID();

    this.permissions =
      options.permissions ?? [];

    this.runtime = options.runtime;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}