import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';
import { MemoryRouter } from 'react-router-dom';
import { StatusBar } from './StatusBar';
import { AppShell } from './AppShell';
import { SessionTimeline } from './SessionTimeline';

describe('StatusBar accessibility', () => {
  test('has role=status on the root element', () => {
    render(<StatusBar />);
    const statusBar = screen.getByRole('status');
    expect(statusBar).toBeTruthy();
  });

  test('has aria-label on the status bar', () => {
    render(<StatusBar />);
    const statusBar = screen.getByRole('status');
    expect(statusBar.getAttribute('aria-label')).toBe('Application status bar');
  });

  test('context usage progress bar has role=progressbar', () => {
    render(<StatusBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressbar.getAttribute('aria-valuenow')).toBeTruthy();
  });

  test('decorative dividers are hidden from screen readers', () => {
    const { container } = render(<StatusBar />);
    const hiddenDividers = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenDividers.length).toBeGreaterThanOrEqual(3);
  });

  test('agents and devices sections have aria-labels', () => {
    render(<StatusBar />);
    expect(screen.getByLabelText('3 agents connected')).toBeTruthy();
    expect(screen.getByLabelText('1 device connected')).toBeTruthy();
  });
});

describe('AppShell accessibility', () => {
  test('main content area has role=main', () => {
    render(
      <MemoryRouter>
        <AppShell>Test content</AppShell>
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main.getAttribute('aria-label')).toBe('Application content');
  });
});

describe('SessionTimeline accessibility', () => {
  test('checkpoint button has aria-label', () => {
    render(<SessionTimeline />);
    const checkpointBtn = screen.getByLabelText('Create checkpoint');
    expect(checkpointBtn).toBeTruthy();
  });

  test('checkpoint button has focus-visible ring classes', () => {
    render(<SessionTimeline />);
    const checkpointBtn = screen.getByLabelText('Create checkpoint');
    expect(checkpointBtn.className).toContain('focus-visible:ring-2');
  });

  test('checkpoint button meets minimum touch target size', () => {
    render(<SessionTimeline />);
    const checkpointBtn = screen.getByLabelText('Create checkpoint');
    expect(checkpointBtn.className).toContain('min-h-[44px]');
    expect(checkpointBtn.className).toContain('min-w-[44px]');
  });
});
