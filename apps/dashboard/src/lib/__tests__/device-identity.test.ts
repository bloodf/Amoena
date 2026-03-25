import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetLocalStorage = vi.fn();
const mockSetLocalStorage = vi.fn();
const mockRemoveLocalStorage = vi.fn();

const localStorageMock = {
  getItem: mockGetLocalStorage,
  setItem: mockSetLocalStorage,
  removeItem: mockRemoveLocalStorage,
};

vi.stubGlobal('localStorage', localStorageMock);

vi.stubGlobal('crypto', {
  subtle: {
    generateKey: vi.fn(),
    importKey: vi.fn(),
    exportKey: vi.fn(),
    digest: vi.fn(),
    sign: vi.fn(),
  },
});

vi.mock('@/lib/client-logger', () => ({
  createClientLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe('DeviceIdentity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocalStorage.mockReturnValue(null);
  });

  describe('getOrCreateDeviceIdentity', () => {
    it('creates new identity when none stored', async () => {
      const mockKeyPair = {
        publicKey: { exportKey: vi.fn() },
        privateKey: { exportKey: vi.fn() },
      };
      (mockGetLocalStorage as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      const { getOrCreateDeviceIdentity } = await import('../device-identity');

      vi.mocked(crypto.subtle.generateKey).mockResolvedValue(
        mockKeyPair as unknown as CryptoKeyPair,
      );
      vi.mocked(crypto.subtle.exportKey).mockResolvedValue(new ArrayBuffer(32));

      await getOrCreateDeviceIdentity();
      expect(crypto.subtle.generateKey).toHaveBeenCalled();
    });

    it('returns stored identity when available', async () => {
      mockGetLocalStorage
        .mockReturnValueOnce('device-id-123')
        .mockReturnValueOnce('public-key-base64')
        .mockReturnValueOnce('private-key-base64');

      const mockPrivateKey = {};
      vi.mocked(crypto.subtle.importKey).mockResolvedValue(mockPrivateKey as CryptoKey);

      const { getOrCreateDeviceIdentity } = await import('../device-identity');
      const identity = await getOrCreateDeviceIdentity();

      expect(identity.deviceId).toBe('device-id-123');
    });

    it('regenerates when stored keys corrupted', async () => {
      mockGetLocalStorage
        .mockReturnValueOnce('device-id-123')
        .mockReturnValueOnce('public-key-base64')
        .mockReturnValueOnce('invalid-private-key');

      vi.mocked(crypto.subtle.importKey).mockRejectedValue(new Error('Corrupted'));

      const mockKeyPair = {
        publicKey: {},
        privateKey: {},
      };
      vi.mocked(crypto.subtle.generateKey).mockResolvedValue(
        mockKeyPair as unknown as CryptoKeyPair,
      );
      vi.mocked(crypto.subtle.exportKey).mockResolvedValue(new ArrayBuffer(32));

      const { getOrCreateDeviceIdentity } = await import('../device-identity');
      await getOrCreateDeviceIdentity();

      expect(crypto.subtle.generateKey).toHaveBeenCalled();
    });
  });

  describe('signPayload', () => {
    it('signs payload with Ed25519 private key', async () => {
      const mockPrivateKey = {};
      const mockSignature = new ArrayBuffer(64);
      vi.mocked(crypto.subtle.sign).mockResolvedValue(mockSignature);

      const { signPayload } = await import('../device-identity');
      const result = await signPayload(mockPrivateKey as CryptoKey, 'test-payload', 1234567890);

      expect(result.signature).toBeDefined();
      expect(result.signedAt).toBe(1234567890);
    });
  });

  describe('getCachedDeviceToken', () => {
    it('returns stored token', async () => {
      mockGetLocalStorage.mockReturnValue('cached-token-abc');
      const { getCachedDeviceToken } = await import('../device-identity');
      expect(getCachedDeviceToken()).toBe('cached-token-abc');
    });

    it('returns null when no token stored', async () => {
      mockGetLocalStorage.mockReturnValue(null);
      const { getCachedDeviceToken } = await import('../device-identity');
      expect(getCachedDeviceToken()).toBeNull();
    });
  });

  describe('cacheDeviceToken', () => {
    it('stores token in localStorage', async () => {
      const { cacheDeviceToken } = await import('../device-identity');
      cacheDeviceToken('new-token-xyz');
      expect(mockSetLocalStorage).toHaveBeenCalledWith('mc-device-token', 'new-token-xyz');
    });
  });

  describe('clearDeviceIdentity', () => {
    it('removes all identity data from localStorage', async () => {
      const { clearDeviceIdentity } = await import('../device-identity');
      clearDeviceIdentity();
      expect(mockRemoveLocalStorage).toHaveBeenCalledTimes(4);
    });
  });
});
