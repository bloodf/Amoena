import { describe, expect, it, mock } from 'bun:test';

// Mock electron modules before importing
const mockShell = {
  openExternal: mock(() => Promise.resolve()),
};

const mockSystemPreferences = {
  isTrustedAccessibilityClient: mock(() => false),
  getMediaAccessStatus: mock(() => 'granted'),
  askForMediaAccess: mock(() => Promise.resolve(true)),
};

mock.module('electron', () => ({
  shell: mockShell,
  systemPreferences: mockSystemPreferences,
}));

// Mock node:fs
mock.module('node:fs', () => ({
  default: {
    accessSync: mock(() => {
      throw new Error('Access denied');
    }),
  },
}));

mock.module('node:os', () => ({
  homedir: () => '/Users/testuser',
}));

mock.module('node:path', () => ({
  default: {
    join: (a: string, b: string) => `${a}/${b}`,
  },
}));

const { createPermissionsRouter } = await import('./permissions');

describe('permissions router', () => {
  it('creates a router with expected shape', () => {
    const router = createPermissionsRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('getStatus query', () => {
    it('returns permission status', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('permissions.getStatus');

      expect(result).toHaveProperty('fullDiskAccess');
      expect(result).toHaveProperty('accessibility');
      expect(result).toHaveProperty('microphone');
      expect(typeof result.fullDiskAccess).toBe('boolean');
      expect(typeof result.accessibility).toBe('boolean');
      expect(typeof result.microphone).toBe('boolean');
    });
  });

  describe('requestFullDiskAccess mutation', () => {
    it('opens system preferences for full disk access', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('permissions.requestFullDiskAccess');

      expect(result).toBeUndefined();
      expect(mockShell.openExternal).toHaveBeenCalledWith(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles',
      );
    });
  });

  describe('requestAccessibility mutation', () => {
    it('opens system preferences for accessibility', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('permissions.requestAccessibility');

      expect(result).toBeUndefined();
      expect(mockShell.openExternal).toHaveBeenCalledWith(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
      );
    });
  });

  describe('requestMicrophone mutation', () => {
    it('requests microphone access on macOS', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('permissions.requestMicrophone');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('granted');
    });
  });

  describe('requestAppleEvents mutation', () => {
    it('opens system preferences for apple events', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('permissions.requestAppleEvents');

      expect(result).toBeUndefined();
      expect(mockShell.openExternal).toHaveBeenCalledWith(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_Automation',
      );
    });
  });

  describe('requestLocalNetwork mutation', () => {
    it('opens privacy and security settings', async () => {
      const router = createPermissionsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('permissions.requestLocalNetwork');

      expect(result).toBeUndefined();
      expect(mockShell.openExternal).toHaveBeenCalledWith(
        'x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension',
      );
    });
  });
});
