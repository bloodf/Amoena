// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OnboardingChecklistWidget } from './onboarding-checklist-widget';

vi.mock('@/lib/navigation', () => ({
  useNavigateToPanel: () => vi.fn(),
}));

vi.mock('@/store', () => ({
  useAmoena: () => ({
    agents: [],
    tasks: [],
    securityPosture: null,
    dashboardMode: 'local',
  }),
}));

afterEach(() => cleanup());

describe('OnboardingChecklistWidget', () => {
  it('renders null when onboarding not completed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: false }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      expect(screen.queryByText('Setup Progress')).toBeNull();
    });
  });

  it('renders null when checklist is dismissed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: true, skipped: false, checklistDismissed: true }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      expect(screen.queryByText('Setup Progress')).toBeNull();
    });
  });

  it('renders checklist when onboarding is completed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: true, skipped: false, checklistDismissed: false }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      expect(screen.getByText('Setup Progress')).toBeDefined();
    });
  });

  it('shows all checklist items', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: true, skipped: false, checklistDismissed: false }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      expect(screen.getByText('Account created')).toBeDefined();
      expect(screen.getByText('Interface mode selected')).toBeDefined();
      expect(screen.getByText('Credentials reviewed')).toBeDefined();
      expect(screen.getByText('Run security scan')).toBeDefined();
      expect(screen.getByText('Dock your first agent')).toBeDefined();
      expect(screen.getByText('Create your first task')).toBeDefined();
    });
  });

  it('renders dismiss button', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: true, skipped: false, checklistDismissed: false }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      expect(screen.getByText('Dismiss')).toBeDefined();
    });
  });

  it('calls dismiss API on dismiss click', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ completed: true, skipped: false, checklistDismissed: false }),
    }) as any;
    render(<OnboardingChecklistWidget />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Dismiss'));
    });
    expect(global.fetch).toHaveBeenCalled();
  });
});
