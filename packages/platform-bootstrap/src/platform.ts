import {
  LifecycleManager
} from "./lifecycle.js";


export class Platform {

  constructor(
    private lifecycle: LifecycleManager
  ){}


  async start() {
    await this.lifecycle.start();
  }


  async stop() {
    await this.lifecycle.stop();
  }


  status() {
    return this.lifecycle.getState();
  }
}