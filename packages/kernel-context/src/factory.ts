import {
  ExecutionContext
} from "./context.js";

import {
  PlatformRuntime
} from "@ccflowx/kernel-runtime";


export interface CreateContextOptions {

  tenantId: string;

  actorId: string;

  permissions?: string[] | undefined;

}


export class ContextFactory {


  constructor(
    private runtime: PlatformRuntime
  ) {}


  create(
    options: CreateContextOptions
  ): ExecutionContext {


const contextOptions = {
  tenantId: options.tenantId,
  actorId: options.actorId,
  runtime: this.runtime,
  ...(options.permissions !== undefined
    ? { permissions: options.permissions }
    : {})
};

return new ExecutionContext(contextOptions);

  }

}