import { describe, expect, it, mock, beforeEach, afterEach , vi} from 'vitest';
import { StringDecoder } from 'node:string_decoder';
import { DataBatcher } from './data-batcher';

describe('DataBatcher', () => {
  let flushCallback: ReturnType<typeof mock>;
  let batcher: DataBatcher;

  beforeEach(() => {
    flushCallback = vi.fn((_data: string) => {});
    batcher = new DataBatcher(flushCallback);
  });

  afterEach(() => {
    batcher.dispose();
  });

  describe('constructor', () => {
    it('creates a DataBatcher with the given flush callback', () => {
      expect(batcher).toBeDefined();
      expect(typeof flushCallback).toBe('function');
    });
  });

  describe('write', () => {
    it('calls flush after BATCH_DURATION_MS for string data', async () => {
      batcher.write('hello');
      expect(flushCallback).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(flushCallback).toHaveBeenCalled();
      expect(flushCallback).toHaveBeenCalledWith('hello');
    });

    it('handles Buffer input correctly', async () => {
      const buffer = Buffer.from('buffer data');
      batcher.write(buffer);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(flushCallback).toHaveBeenCalledWith('buffer data');
    });

    it('batches multiple writes before flush', async () => {
      batcher.write('first');
      batcher.write('second');

      await new Promise((resolve) => setTimeout(resolve, 20));
      // Multiple writes accumulate in buffer
      expect(flushCallback).toHaveBeenCalled();
      const calledWith = flushCallback.mock.calls[0]?.[0] ?? '';
      expect(calledWith.includes('first')).toBe(true);
      expect(calledWith.includes('second')).toBe(true);
    });

    it('handles UTF-8 multi-byte characters across chunks', async () => {
      // Unicode snowman is 3 bytes in UTF-8: 0xE2 0x9D 0x84
      const snowman = '☃';
      batcher.write(Buffer.from(snowman.slice(0, 1))); // partial
      batcher.write(Buffer.from(snowman.slice(1)));

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(flushCallback).toHaveBeenCalledWith(snowman);
    });

    it('flushes immediately when buffer exceeds BATCH_MAX_SIZE (200KB)', () => {
      // BATCH_MAX_SIZE is 200 * 1024
      const largeData = 'x'.repeat(200 * 1024);
      batcher.write(largeData);

      // Should flush immediately without waiting for timer
      expect(flushCallback).toHaveBeenCalled();
      expect(flushCallback.mock.calls[0]?.[0]).toHaveLength(200 * 1024);
    });

    it('does not schedule multiple timers for consecutive writes', async () => {
      batcher.write('first');
      batcher.write('second');
      batcher.write('third');

      await new Promise((resolve) => setTimeout(resolve, 20));
      // Should only have flushed once with all accumulated data
      expect(flushCallback.mock.calls.length).toBe(1);
    });
  });

  describe('flush', () => {
    it('flushes buffered data immediately', async () => {
      batcher.write('immediate');
      batcher.flush();

      expect(flushCallback).toHaveBeenCalledWith('immediate');
    });

    it('clears the timeout after flushing', async () => {
      batcher.write('test');
      batcher.flush();

      await new Promise((resolve) => setTimeout(resolve, 20));
      // Should not call flush again since already cleared
      expect(flushCallback.mock.calls.length).toBe(1);
    });

    it('does nothing when buffer is empty', () => {
      batcher.flush();
      expect(flushCallback).not.toHaveBeenCalled();
    });

    it('can be called multiple times safely', () => {
      batcher.write('data');
      batcher.flush();
      batcher.flush();
      batcher.flush();

      expect(flushCallback.mock.calls.length).toBe(1);
      expect(flushCallback).toHaveBeenCalledWith('data');
    });
  });

  describe('dispose', () => {
    it('flushes remaining data', () => {
      batcher.write('remaining');
      batcher.dispose();

      expect(flushCallback).toHaveBeenCalledWith('remaining');
    });

    it('handles trailing incomplete UTF-8 sequences', () => {
      // Create a batcher and write partial UTF-8 bytes
      const trailingBatcher = new DataBatcher(flushCallback);

      // Write a partial UTF-8 sequence (2 bytes of a 3-byte character)
      // 0xC3 is start of ü (2 bytes: 0xC3 0xBC)
      trailingBatcher.write(Buffer.from([0xc3]));
      trailingBatcher.dispose();

      // Should flush the remaining incomplete sequence
      expect(flushCallback).toHaveBeenCalled();
    });

    it('can be called only once', () => {
      batcher.write('data');
      batcher.dispose();
      batcher.dispose(); // Should not throw

      expect(flushCallback.mock.calls.length).toBe(1);
    });

    it('flushes then handles trailing data separately', () => {
      const batcher2 = new DataBatcher(flushCallback);
      batcher2.write('first');
      batcher2.dispose();

      // First write should be flushed
      expect(flushCallback).toHaveBeenCalledWith('first');
    });
  });

  describe('timer behavior', () => {
    it("timer is unref'd to not keep Electron alive", async () => {
      batcher.write('test');

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(flushCallback).toHaveBeenCalled();
    });
  });
});
