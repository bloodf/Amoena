import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { OpinionsScreen } from '@/screens/OpinionsScreen';
import { useIsMobile } from '@/hooks/use-mobile';

function MobileProbe() {
  return <span>{useIsMobile() ? 'mobile' : 'desktop'}</span>;
}

describe('Amoena mobile shell and opinions', () => {
  test('useIsMobile responds to viewport width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        matches: true,
        media: '(max-width: 767px)',
        addEventListener: vi.fn(() => {}),
        removeEventListener: vi.fn(() => {}),
      }),
      configurable: true,
    });

    render(<MobileProbe />);
    expect(screen.getByText('mobile')).toBeTruthy();
  });

  test('app shell opens the mobile sidebar toggle', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        matches: true,
        media: '(max-width: 767px)',
        addEventListener: vi.fn(() => {}),
        removeEventListener: vi.fn(() => {}),
      }),
      configurable: true,
    });

    render(
      <MemoryRouter>
        <AppShell>
          <div>Child</div>
        </AppShell>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText('Session')[0]);
    expect(document.querySelector("[class*='backdrop-blur-sm']")).toBeNull();
  });

  test('app shell desktop search callback fires', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        matches: false,
        media: '(max-width: 767px)',
        addEventListener: vi.fn(() => {}),
        removeEventListener: vi.fn(() => {}),
      }),
      configurable: true,
    });

    const onOpenCommandPalette = vi.fn(() => {});
    render(
      <MemoryRouter>
        <AppShell onOpenCommandPalette={onOpenCommandPalette}>
          <div>Child</div>
        </AppShell>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(onOpenCommandPalette).toHaveBeenCalled();
  });

  test('useIsMobile reacts to media-query change callbacks', () => {
    let changeHandler: (() => void) | undefined;
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        matches: false,
        media: '(max-width: 767px)',
        addEventListener: (_: string, handler: () => void) => {
          changeHandler = handler;
        },
        removeEventListener: vi.fn(() => {}),
      }),
      configurable: true,
    });

    render(<MobileProbe />);
    expect(screen.getByText('desktop')).toBeTruthy();
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true, writable: true });
    act(() => {
      changeHandler?.();
    });
    expect(screen.getByText('mobile')).toBeTruthy();
  });

  test('opinions screen switches categories, adds, edits, and deletes an opinion', () => {
    render(<OpinionsScreen />);

    fireEvent.click(screen.getByText('Architecture'));
    expect(screen.getByText('Database access')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Add Opinion/i }));
    fireEvent.change(screen.getByPlaceholderText(/Opinion title/i), {
      target: { value: 'Latency budget' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), {
      target: { value: 'Performance rule' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Value \/ preference/i), {
      target: { value: '<200ms p95' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));
    expect(screen.getByText('Latency budget')).toBeTruthy();

    const row = screen.getByText('Latency budget').closest('.group') as HTMLElement;
    const iconButtons = Array.from(row.querySelectorAll('button'));
    fireEvent.click(iconButtons[0]);
    const editInput = screen.getByDisplayValue('<200ms p95');
    fireEvent.change(editInput, { target: { value: '<150ms p95' } });
    fireEvent.keyDown(editInput, { key: 'Enter' });
    expect(screen.getByText('<150ms p95')).toBeTruthy();

    const updatedRow = screen.getByText('Latency budget').closest('.group') as HTMLElement;
    fireEvent.click(updatedRow.querySelectorAll('button')[1]);
    expect(screen.queryByText('Latency budget')).toBeNull();
  });
});
