import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeviceScreen } from './device-screen';

const mockRemoteDeviceMe = vi.fn();
const mockClearPairing = vi.fn();

vi.mock('@lunaria/i18n', () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/runtime/client-context', () => ({
  useClient: () => ({
    client: { remoteDeviceMe: mockRemoteDeviceMe },
    auth: { accessToken: 'tok', baseUrl: 'http://localhost:47821' },
    clearPairing: mockClearPairing,
  }),
}));

describe('DeviceScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device title', async () => {
    mockRemoteDeviceMe.mockResolvedValue({
      deviceId: 'device-abc123',
      platform: 'iOS',
      deviceType: 'iPhone 15 Pro',
      scopes: ['read', 'write'],
      pairedAt: '2026-03-01T10:00:00Z',
    });

    render(<DeviceScreen />);
    expect(screen.getByText('mobile.device')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    mockRemoteDeviceMe.mockImplementation(() => new Promise(() => {}));

    render(<DeviceScreen />);
    expect(screen.getByText('mobile.loadingDevice')).toBeTruthy();
  });

  it('shows not paired message when remoteDeviceMe returns null', async () => {
    mockRemoteDeviceMe.mockResolvedValue(null);

    render(<DeviceScreen />);

    await waitFor(() => {
      expect(screen.getByText('mobile.notPaired')).toBeTruthy();
    });
  });

  it('renders device info when paired', async () => {
    mockRemoteDeviceMe.mockResolvedValue({
      deviceId: 'device-abc123',
      platform: 'iOS',
      deviceType: 'iPhone 15 Pro',
      scopes: ['read', 'write'],
      pairedAt: '2026-03-01T10:00:00Z',
    });

    render(<DeviceScreen />);

    await waitFor(() => {
      expect(screen.getAllByText(/device-abc123/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/iOS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/iPhone 15 Pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/read, write/i).length).toBeGreaterThan(0);
  });

  it('displays pairedAt date when provided', async () => {
    mockRemoteDeviceMe.mockResolvedValue({
      deviceId: 'device-xyz',
      scopes: ['sessions'],
      pairedAt: '2026-03-01T10:00:00Z',
    });

    render(<DeviceScreen />);

    await waitFor(() => {
      expect(screen.getAllByText(/2026/i).length).toBeGreaterThan(0);
    });
  });
});
