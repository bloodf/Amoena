import type { OrchestrationCommand } from "./commands.js";
import type { OrchestrationEvent } from "./events.js";
import type { EventStore } from "./event-store.js";
import type { OrchestrationReadModel } from "./read-model.js";
import { decide, InvariantError } from "./decider.js";
import { project } from "./projector.js";
import { createEmptyReadModel } from "./read-model.js";
import { OrchestrationPubSub } from "./pubsub.js";

export { InvariantError };

/**
 * Single-writer command bus.
 *
 * All commands are serialized through a queue — only one command is processed
 * at a time. This prevents concurrent mutations to the read model and keeps
 * the decider's invariant checks consistent.
 *
 * Flow per command:
 *   1. Call decider (pure, reads current read model)
 *   2. Persist resulting events to event store (durable)
 *   3. Project events into the in-memory read model
 *   4. Publish events to PubSub (broadcast to subscribers)
 *   5. Resolve the caller's promise with the emitted events
 */
export class CommandBus {
  private readonly queue: Array<{
    command: OrchestrationCommand;
    resolve: (events: OrchestrationEvent[]) => void;
    reject: (err: unknown) => void;
  }> = [];
  private processing = false;
  private readModel: OrchestrationReadModel = createEmptyReadModel();
  private readonly store: EventStore;
  private readonly pubSub: OrchestrationPubSub;

  constructor(store: EventStore, pubSub: OrchestrationPubSub) {
    this.store = store;
    this.pubSub = pubSub;
  }

  /**
   * Hydrate the read model from all persisted events.
   * Call once on startup before dispatching any commands.
   */
  hydrate(): void {
    const events = this.store.loadAll();
    for (const evt of events) {
      this.readModel = project(this.readModel, evt);
    }
  }

  /** Current snapshot of the read model (immutable copy) */
  getReadModel(): OrchestrationReadModel {
    return this.readModel;
  }

  /**
   * Dispatch a command. Returns the events it produced, or throws InvariantError
   * if the command violates a business invariant.
   *
   * Commands are serialized — concurrent callers queue behind each other.
   */
  dispatch(command: OrchestrationCommand): Promise<OrchestrationEvent[]> {
    return new Promise<OrchestrationEvent[]>((resolve, reject) => {
      this.queue.push({ command, resolve, reject });
      if (!this.processing) {
        void this._drain();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private async _drain(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      try {
        const result = decide(item.command, this.readModel);

        if (result instanceof InvariantError) {
          item.reject(result);
          continue;
        }

        const events: OrchestrationEvent[] = result;

        // 1. Persist (synchronous in better-sqlite3)
        this.store.append(events);

        // 2. Project into in-memory read model (immutable updates)
        for (const evt of events) {
          this.readModel = project(this.readModel, evt);
        }

        // 3. Broadcast to subscribers
        this.pubSub.publish(events);

        item.resolve(events);
      } catch (err) {
        item.reject(err);
      }
    }

    this.processing = false;
  }
}
