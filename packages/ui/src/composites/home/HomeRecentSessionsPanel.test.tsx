// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HomeRecentSessionsPanel } from './HomeRecentSessionsPanel';
import type { HomeSessionItem } from './types';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowRight: () => <svg data-testid="arrow-icon" />,
  Circle: ({ className }: { size?: number; className: string }) => (
    <svg data-testid="circle-icon" className={className} />
  ),
  Search: () => <svg data-testid="search-icon" />,
}));

const mockSessions: HomeSessionItem[] = [
  {
    title: 'Auth implementation',
    model: 'Claude',
    tuiColor: 'tui-claude',
    time: '2h ago',
    tokens: '45K',
    branch: 'main',
  },
  {
    title: 'Fix login bug',
    model: 'Claude',
    tuiColor: 'tui-claude',
    time: '1h ago',
    tokens: '12K',
    branch: 'fix/login',
  },
];

describe('HomeRecentSessionsPanel', () => {
  test('renders section title', () => {
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={vi.fn()}
        sessions={[]}
        onOpenSession={vi.fn()}
      />,
    );
    expect(screen.getByText('Recent Sessions')).toBeTruthy();
  });

  test('renders search input', () => {
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={vi.fn()}
        sessions={[]}
        onOpenSession={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText('Filter sessions...')).toBeTruthy();
  });

  test('renders session titles', () => {
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={vi.fn()}
        sessions={mockSessions}
        onOpenSession={vi.fn()}
      />,
    );
    expect(screen.getByText('Auth implementation')).toBeTruthy();
    expect(screen.getByText('Fix login bug')).toBeTruthy();
  });

  test('calls onSearchChange when typing in search', () => {
    const onSearchChange = vi.fn();
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={onSearchChange}
        sessions={mockSessions}
        onOpenSession={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Filter sessions...'), {
      target: { value: 'auth' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('auth');
  });

  test('shows empty state when no sessions match search', () => {
    render(
      <HomeRecentSessionsPanel
        searchQuery="nonexistent"
        onSearchChange={vi.fn()}
        sessions={[]}
        onOpenSession={vi.fn()}
      />,
    );
    expect(screen.getByText(/No sessions match/)).toBeTruthy();
  });

  test('calls onOpenSession when session clicked', () => {
    const onOpenSession = vi.fn();
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={vi.fn()}
        sessions={mockSessions}
        onOpenSession={onOpenSession}
      />,
    );
    fireEvent.click(screen.getByText('Auth implementation'));
    expect(onOpenSession).toHaveBeenCalledWith(mockSessions[0]);
  });

  test('renders session branch and token info', () => {
    render(
      <HomeRecentSessionsPanel
        searchQuery=""
        onSearchChange={vi.fn()}
        sessions={mockSessions}
        onOpenSession={vi.fn()}
      />,
    );
    expect(screen.getByText('main')).toBeTruthy();
    expect(screen.getByText('45K')).toBeTruthy();
  });
});
