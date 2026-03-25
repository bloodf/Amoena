// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/setup',
}));

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/setup',
  replace: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock @/lib/setup-status
vi.mock('@/lib/setup-status', () => ({
  fetchSetupStatusWithRetry: vi.fn(),
}));

// Mock @/components/ui/button
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
  }) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock @/components/ui/language-switcher
vi.mock('@/components/ui/language-switcher', () => ({
  LanguageSwitcherSelect: () => null,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SetupPage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockLocation.replace.mockReset();
  });

  it('module is importable', async () => {
    const mod = await import('./page');
    expect(mod).toBeDefined();
  });

  it('shows loading state while checking setup status', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    expect(screen.getByText('checkingSetupStatus')).toBeInTheDocument();
  });

  it('shows error state when setup status check fails', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockRejectedValue(new Error('Network error'));
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByText('failedToCheckSetup')).toBeInTheDocument();
    });
  });

  it('shows retry button on setup check failure', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockRejectedValue(new Error('Network error'));
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'retry' })).toBeInTheDocument();
    });
  });

  it('renders setup form when setup is needed', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
      expect(screen.getByLabelText('password')).toBeInTheDocument();
    });
  });

  it('has default username pre-filled', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      const usernameInput = screen.getByLabelText('username') as HTMLInputElement;
      expect(usernameInput.value).toBe('admin');
    });
  });

  it('redirects to login when setup is not needed', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: false });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(mockLocation.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('shows password mismatch error', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    const passwordInput = screen.getByLabelText('password');
    const confirmInput = screen.getByLabelText('confirmPassword');
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'differentpassword');
    await user.tab(); // Trigger validation
    await waitFor(() => {
      expect(screen.getByText('passwordsDoNotMatch')).toBeInTheDocument();
    });
  });

  it('shows password too short error for passwords under 12 chars', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    const passwordInput = screen.getByLabelText('password');
    await user.type(passwordInput, 'short');
    await waitFor(() => {
      expect(screen.getByText(/moreCharsNeeded/)).toBeInTheDocument();
    });
  });

  it('shows validation error when password is too short on submit', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('password'), 'short');
    await user.click(screen.getByRole('button', { name: 'createAdminAccount' }));
    await waitFor(() => {
      expect(screen.getByText('passwordTooShort')).toBeInTheDocument();
    });
  });

  it('does not submit when passwords do not match', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('password'), 'password123456');
    await user.type(screen.getByLabelText('confirmPassword'), 'differentpassword');
    await user.click(screen.getByRole('button', { name: 'createAdminAccount' }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls setup API with correct payload on successful submit', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    await user.clear(screen.getByLabelText('username'));
    await user.type(screen.getByLabelText('username'), 'newadmin');
    await user.type(screen.getByLabelText('password'), 'password123456');
    await user.type(screen.getByLabelText('confirmPassword'), 'password123456');
    await user.click(screen.getByRole('button', { name: 'createAdminAccount' }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/setup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'newadmin',
            password: 'password123456',
            displayName: undefined,
          }),
        }),
      );
    });
  });

  it('shows creating state with progress indicator after form submission', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('password'), 'password123456');
    await user.type(screen.getByLabelText('confirmPassword'), 'password123456');
    await user.click(screen.getByRole('button', { name: 'createAdminAccount' }));
    await waitFor(() => {
      expect(screen.getByText('settingUpMC')).toBeInTheDocument();
    });
  });

  it('handles setup API error and returns to form', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('username')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('password'), 'password123456');
    await user.type(screen.getByLabelText('confirmPassword'), 'password123456');
    await user.click(screen.getByRole('button', { name: 'createAdminAccount' }));
    await waitFor(
      () => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders display name field as optional', async () => {
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/displayName/)).toBeInTheDocument();
    });
  });

  it('updates display name state', async () => {
    const user = userEvent.setup();
    const { fetchSetupStatusWithRetry } = await import('@/lib/setup-status');
    vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
    const { default: SetupPage } = await import('./page');
    render(<SetupPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/displayName/)).toBeInTheDocument();
    });
    const displayNameInput = screen.getByLabelText(/displayName/);
    await user.type(displayNameInput, 'Admin User');
    expect(displayNameInput).toHaveValue('Admin User');
  });
});
