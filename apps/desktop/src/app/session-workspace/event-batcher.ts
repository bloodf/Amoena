/**
 * Batches high-frequency SSE events to reduce React render cycles.
 *
 * Collects events for `intervalMs` (default 50ms) then flushes them
 * as a single batch to the provided callback.  Call `dispose()` to
 * clear the internal timer and flush any remaining events.
 */
export interface EventBatcher<T> {
  /** Enqueue a single event into the current batch. */
  push(event: T): void;
  /** Clear the timer and flush any remaining events. */
  dispose(): void;
}

export function createEventBatcher<T>(
  onFlush: (batch: ReadonlyArray<T>) => void,
  intervalMs = 50,
): EventBatcher<T> {
  let buffer: T[] = [];
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];
    onFlush(batch);
  }

  function scheduleFlush() {
    if (timerId !== null) return;
    timerId = setTimeout(() => {
      timerId = null;
      flush();
    }, intervalMs);
  }

  return {
    push(event: T) {
      buffer.push(event);
      scheduleFlush();
    },
    dispose() {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      flush();
    },
  };
}
