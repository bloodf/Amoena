import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, mock, test, vi } from "vitest";
import { HomeRecentSessionsPanel } from './HomeRecentSessionsPanel';

vi.mock('lucide-react', () => ({
  ArrowRight: ({ size }: { size: number }) => (
    <span data-testid="arrow-right" style={{ width: size, height: size }} />
  ),
  Circle: ({ size }: { size: number }) => (
    <span data-testid="circle" style={{ width: size, height: size }} />
  ),
  Search: ({ size }: { size: number }) => (
    <span data-testid="search" style={{ width: size, height: size }} />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

function makeProps(overrides: Partial<Parameters<typeof HomeRecentSessionsPanel>[0]> = {}) {
  return {
    searchQuery: 'claude',
    onSearchChange: vi.fn(() => {}),
    sessions: [
      {
        title: 'Session Alpha',
        branch: 'feat/alpha',
        tokens: '12.4k',
        time: '2m ago',
        tuiColor: 'tui-claude',
        model: 'claude',
      },
      {
        title: 'Session Beta',
        branch: 'feat/beta',
        tokens: '8.1k',
        time: '20m ago',
        tuiColor: 'tui-codex',
        model: 'codex',
      },
    ],
    onOpenSession: vi.fn(() => {}),
    ...overrides,
  };
}

describe('HomeRecentSessionsPanel', () => {
  test('renders search input and session rows', () => {
    render(<HomeRecentSessionsPanel {...makeProps()} />);
    expect(screen.getByPlaceholderText('Filter sessions...')).toBeTruthy();
    expect(screen.getByText('Session Alpha')).toBeTruthy();
    expect(screen.getByText('Session Beta')).toBeTruthy();
  });

  test('calls onSearchChange when the filter input changes', () => {
    const onSearchChange = vi.fn(() => {});
    render(<HomeRecentSessionsPanel {...makeProps({ onSearchChange })} />);
    fireEvent.change(screen.getByPlaceholderText('Filter sessions...'), {
      target: { value: 'beta' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('beta');
  });

  test('calls onOpenSession with the clicked session', () => {
    const onOpenSession = vi.fn(() => {});
    const props = makeProps({ onOpenSession });
    render(<HomeRecentSessionsPanel {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Session Alpha/ }));
    expect(onOpenSession).toHaveBeenCalledWith(props.sessions[0]);
  });

  test('renders an empty state when no sessions match', () => {
    render(<HomeRecentSessionsPanel {...makeProps({ sessions: [] })} />);
    expect(screen.getByText('No sessions match "claude"')).toBeTruthy();
  });

  test('applies tui color classes to the status dots', () => {
    render(<HomeRecentSessionsPanel {...makeProps()} />);
    const dots = screen.getAllByTestId('circle');
    expect(dots[0].className).toContain('text-tui-claude');
    expect(dots[1].className).toContain('text-tui-codex');
  });
});
