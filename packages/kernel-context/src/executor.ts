import {
  ExecutionContext
} from "./context.js";


export class ContextExecutor {


  constructor(
    private context: ExecutionContext
  ){}


  execute<T>(
    operation: () => T
  ): T {


    return operation();

  }


  getContext(){

    return this.context;

  }

}