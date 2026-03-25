import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockCreateConnection = vi.fn();

vi.mock('node:net', () => ({
  default: {
    createConnection: mockCreateConnection,
  },
}));

describe('provisioner-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('runProvisionerCommand', () => {
    it('throws when MC_PROVISIONER_TOKEN not configured', async () => {
      delete process.env.MC_PROVISIONER_TOKEN;
      const { runProvisionerCommand } = await import('../provisioner-client');
      await expect(
        runProvisionerCommand({
          command: 'test',
          args: [],
          timeoutMs: 5000,
          dryRun: false,
        }),
      ).rejects.toThrow('MC_PROVISIONER_TOKEN is not configured');
    });

    it('calls provisioner socket and returns result on success', async () => {
      process.env.MC_PROVISIONER_TOKEN = 'test-token';

      const mockSocket = {
        on: vi.fn((event: string, cb: (arg: Buffer) => void) => {
          if (event === 'connect') cb(Buffer.from(''));
          if (event === 'data') {
            cb(Buffer.from(JSON.stringify({ ok: true, stdout: 'result' }) + '\n'));
          }
        }),
        write: vi.fn(),
        destroy: vi.fn(),
        end: vi.fn(),
      };

      mockCreateConnection.mockReturnValue(
        mockSocket as unknown as ReturnType<typeof mockCreateConnection>,
      );

      const { runProvisionerCommand } = await import('../provisioner-client');
      const result = await runProvisionerCommand({
        command: 'test-cmd',
        args: ['arg1'],
        timeoutMs: 5000,
        dryRun: false,
      });

      expect(mockSocket.write).toHaveBeenCalled();
      expect(result.stdout).toBe('result');
    });
  });
});
