// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HomeSystemHealthPanel } from './HomeSystemHealthPanel';
import type { HomeProviderHealth } from './types';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Circle: ({ size, className }: { size: number; className: string }) => (
    <svg data-testid="circle-icon" className={className} />
  ),
  Cpu: ({ size }: { size: number }) => <svg data-testid="cpu-icon" />,
}));

const mockProviders: HomeProviderHealth[] = [
  { name: 'Claude', status: 'connected', color: 'tui-claude' },
  { name: 'OpenCode', status: 'error', color: 'tui-opencode' },
  { name: 'Gemini', status: 'disconnected', color: 'tui-gemini' },
];

describe('HomeSystemHealthPanel', () => {
  test('renders section title', () => {
    render(<HomeSystemHealthPanel providers={[]} onOpenProvider={vi.fn()} />);
    expect(screen.getByText('System Health')).toBeTruthy();
  });

  test('renders provider names', () => {
    render(<HomeSystemHealthPanel providers={mockProviders} onOpenProvider={vi.fn()} />);
    expect(screen.getByText('Claude')).toBeTruthy();
    expect(screen.getByText('OpenCode')).toBeTruthy();
    expect(screen.getByText('Gemini')).toBeTruthy();
  });

  test('renders provider status labels', () => {
    render(<HomeSystemHealthPanel providers={mockProviders} onOpenProvider={vi.fn()} />);
    expect(screen.getByText('connected')).toBeTruthy();
    expect(screen.getByText('error')).toBeTruthy();
    expect(screen.getByText('disconnected')).toBeTruthy();
  });

  test('renders memory usage indicator', () => {
    render(<HomeSystemHealthPanel providers={mockProviders} onOpenProvider={vi.fn()} />);
    expect(screen.getByText('5.1 GB used')).toBeTruthy();
    expect(screen.getByTestId('cpu-icon')).toBeTruthy();
  });

  test('calls onOpenProvider with provider when clicked', () => {
    const onOpenProvider = vi.fn();
    render(<HomeSystemHealthPanel providers={mockProviders} onOpenProvider={onOpenProvider} />);
    fireEvent.click(screen.getByText('Claude'));
    expect(onOpenProvider).toHaveBeenCalledWith(mockProviders[0]);
  });

  test('renders circle icons for each provider', () => {
    render(<HomeSystemHealthPanel providers={mockProviders} onOpenProvider={vi.fn()} />);
    const circles = screen.getAllByTestId('circle-icon');
    expect(circles.length).toBe(3);
  });
});
