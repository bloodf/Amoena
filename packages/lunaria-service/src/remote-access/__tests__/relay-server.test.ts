import { describe, expect, test } from 'bun:test';
import { RelayServer } from '../relay-server';

describe('RelayServer', () => {
  test('starts and stops without error', async () => {
    const server = new RelayServer({ port: 0 });
    // start() is synchronous for ws server creation
    expect(() => server.start()).not.toThrow();
    await server.stop();
  });

  test('calling stop on a stopped server resolves immediately', async () => {
    const server = new RelayServer({ port: 0 });
    await expect(server.stop()).resolves.toBeUndefined();
  });

  test('clientCount starts at zero', () => {
    const server = new RelayServer({ port: 0 });
    expect(server.clientCount).toBe(0);
  });

  test('start is idempotent', async () => {
    const server = new RelayServer({ port: 0 });
    server.start();
    expect(() => server.start()).not.toThrow();
    await server.stop();
  });
});
