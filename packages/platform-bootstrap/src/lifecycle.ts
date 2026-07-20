export enum PlatformState {
  CREATED = "CREATED",
  INITIALIZING = "INITIALIZING",
  RUNNING = "RUNNING",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED"
}


export class LifecycleManager {

  private state: PlatformState =
    PlatformState.CREATED;


  getState(): PlatformState {
    return this.state;
  }


  async start(
    initializer?: () => Promise<void>
  ) {

    this.state = PlatformState.INITIALIZING;


    if (initializer) {
      await initializer();
    }


    this.state = PlatformState.RUNNING;
  }


  async stop(
    shutdown?: () => Promise<void>
  ) {

    this.state = PlatformState.STOPPING;


    if (shutdown) {
      await shutdown();
    }


    this.state = PlatformState.STOPPED;
  }
}