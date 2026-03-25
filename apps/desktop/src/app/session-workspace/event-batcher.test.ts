import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createEventBatcher } from './event-batcher';

describe('createEventBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('batches events and flushes after the interval', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.push('a');
    batcher.push('b');
    batcher.push('c');

    expect(onFlush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('does not flush when buffer is empty', () => {
    const onFlush = vi.fn();
    createEventBatcher<string>(onFlush, 50);

    vi.advanceTimersByTime(100);

    expect(onFlush).not.toHaveBeenCalled();
  });

  it('flushes remaining events on dispose', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.push('x');
    batcher.push('y');

    batcher.dispose();

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(['x', 'y']);
  });

  it('clears the timer on dispose so no double flush', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.push('a');
    batcher.dispose();

    vi.advanceTimersByTime(100);

    // Should only have flushed once from dispose, not again from timer
    expect(onFlush).toHaveBeenCalledTimes(1);
  });

  it('does not schedule multiple timers for consecutive pushes', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.push('1');
    batcher.push('2');
    batcher.push('3');

    vi.advanceTimersByTime(50);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('starts a new batch after a flush', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.push('first');
    vi.advanceTimersByTime(50);

    batcher.push('second');
    vi.advanceTimersByTime(50);

    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenNthCalledWith(1, ['first']);
    expect(onFlush).toHaveBeenNthCalledWith(2, ['second']);
  });

  it('uses custom interval', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<number>(onFlush, 100);

    batcher.push(42);

    vi.advanceTimersByTime(50);
    expect(onFlush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([42]);
  });

  it('dispose with empty buffer does not call onFlush', () => {
    const onFlush = vi.fn();
    const batcher = createEventBatcher<string>(onFlush, 50);

    batcher.dispose();

    expect(onFlush).not.toHaveBeenCalled();
  });
});
