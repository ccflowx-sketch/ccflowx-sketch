export interface PlatformEvent<T = unknown> {
  type: string;
  timestamp: Date;
  payload: T;
}

export type EventHandler<T> = (
  event: PlatformEvent<T>
) => void | Promise<void>;

export class EventBus<
  TEvents extends object
> {

  private readonly handlers = new Map<
    keyof TEvents,
    EventHandler<any>[]
  >();

  subscribe<K extends keyof TEvents>(
    type: K,
    handler: EventHandler<TEvents[K]>
  ): () => void {
    const handlers =
      this.handlers.get(type) ?? [];

    handlers.push(handler);

    this.handlers.set(type, handlers);

    return () => {
      const current =
        this.handlers.get(type);

      if (!current) {
        return;
      }

      const index =
        current.indexOf(handler);

      if (index !== -1) {
        current.splice(index, 1);
      }

      if (current.length === 0) {
        this.handlers.delete(type);
      }
    };
  }

  async publish<K extends keyof TEvents>(
    event: PlatformEvent<TEvents[K]> & {
      type: K;
    }
  ): Promise<void> {
    const handlers =
      this.handlers.get(event.type) ?? [];

    for (const handler of handlers) {
      await handler(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}