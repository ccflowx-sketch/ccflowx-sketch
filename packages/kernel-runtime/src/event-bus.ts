export interface PlatformEvent<T = unknown> {
  type: string;
  timestamp: Date;
  payload: T;
}

export type EventHandler<T = unknown> = (
  event: PlatformEvent<T>
) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(
    type: string,
    handler: EventHandler
  ): () => void {
    const handlers =
      this.handlers.get(type) ?? [];

    handlers.push(handler);

    this.handlers.set(type, handlers);

    return () => {
      const currentHandlers =
        this.handlers.get(type);

      if (!currentHandlers) {
        return;
      }

      const index =
        currentHandlers.indexOf(handler);

      if (index !== -1) {
        currentHandlers.splice(index, 1);
      }

      if (currentHandlers.length === 0) {
        this.handlers.delete(type);
      }
    };
  }

  async publish(
    event: PlatformEvent
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

"*"

