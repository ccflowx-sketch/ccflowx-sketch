export interface PlatformModule {
  name: string;
  version: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface ExecutionContext {
  tenantId: string;
  actorId?: string;
  correlationId: string;
}