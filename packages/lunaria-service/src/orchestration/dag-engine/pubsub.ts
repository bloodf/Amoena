import { EventEmitter } from "node:events";
import type { OrchestrationEvent } from "./events.js";

type EventHandler = (event: OrchestrationEvent) => void;

/**
 * Typed PubSub for broadcasting OrchestrationEvents to subscribers
 * (e.g. WebSocket clients, UI panels).
 *
 * Usage:
 *   const bus = new OrchestrationPubSub();
 *   const unsub = bus.subscribe((evt) => sendToClient(evt));
 *   bus.publish(events);
 *   unsub(); // cleanup
 */
export class OrchestrationPubSub {
  private readonly emitter = new EventEmitter();
  private static readonly CHANNEL = "orchestration:event";

  /** Publish a batch of events to all subscribers */
  publish(events: OrchestrationEvent[]): void {
    for (const event of events) {
      this.emitter.emit(OrchestrationPubSub.CHANNEL, event);
    }
  }

  /** Subscribe to all events; returns an unsubscribe function */
  subscribe(handler: EventHandler): () => void {
    this.emitter.on(OrchestrationPubSub.CHANNEL, handler);
    return () => {
      this.emitter.off(OrchestrationPubSub.CHANNEL, handler);
    };
  }

  /** Subscribe only to events for a specific goal run */
  subscribeToGoal(goalRunId: string, handler: EventHandler): () => void {
    const filtered: EventHandler = (event) => {
      if (event.goalRunId === goalRunId) {
        handler(event);
      }
    };
    this.emitter.on(OrchestrationPubSub.CHANNEL, filtered);
    return () => {
      this.emitter.off(OrchestrationPubSub.CHANNEL, filtered);
    };
  }

  /** Remove all listeners (e.g. on shutdown) */
  dispose(): void {
    this.emitter.removeAllListeners(OrchestrationPubSub.CHANNEL);
  }
}
