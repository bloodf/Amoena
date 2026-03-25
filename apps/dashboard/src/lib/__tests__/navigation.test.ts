import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
}));

const mockUsePathname = vi.fn(() => '/current/path');

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

vi.mock('@/lib/navigation-metrics', () => ({
  startNavigationTiming: vi.fn(),
}));

vi.mock('@/store', () => ({
  useAmoena: vi.fn(() => ({
    setActiveTab: vi.fn(),
    setChatPanelOpen: vi.fn(),
  })),
}));

describe('navigation', () => {
  describe('panelHref', () => {
    it('returns / for overview panel', async () => {
      const { panelHref } = await import('../navigation');
      expect(panelHref('overview')).toBe('/');
    });

    it('returns /panel for other panels', async () => {
      const { panelHref } = await import('../navigation');
      expect(panelHref('chat')).toBe('/chat');
      expect(panelHref('tasks')).toBe('/tasks');
    });
  });

  describe('useNavigateToPanel', () => {
    it('returns a function', async () => {
      const { useNavigateToPanel } = await import('../navigation');
      const hook = useNavigateToPanel();
      expect(typeof hook).toBe('function');
    });
  });

  describe('usePrefetchPanel', () => {
    it('returns a function', async () => {
      const { usePrefetchPanel } = await import('../navigation');
      const hook = usePrefetchPanel();
      expect(typeof hook).toBe('function');
    });
  });
});
