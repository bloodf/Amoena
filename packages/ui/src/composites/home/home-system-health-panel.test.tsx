import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, mock, test } from 'bun:test';
import { HomeSystemHealthPanel } from './HomeSystemHealthPanel';
import type { HomeProviderHealth } from './types';

mock.module('lucide-react', () => ({
  Circle: ({ size }: { size: number }) => (
    <span data-testid="circle" style={{ width: size, height: size }} />
  ),
  Cpu: ({ size }: { size: number }) => (
    <span data-testid="cpu" style={{ width: size, height: size }} />
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

function makeProps(overrides: Partial<Parameters<typeof HomeSystemHealthPanel>[0]> = {}) {
  return {
    providers: [
      { name: 'Claude', status: 'connected', color: 'green' },
      { name: 'Codex', status: 'error', color: 'red' },
      { name: 'Gemini', status: 'disconnected', color: 'gray' },
    ] satisfies HomeProviderHealth[],
    onOpenProvider: mock(() => {}),
    ...overrides,
  };
}

describe('HomeSystemHealthPanel', () => {
  test('renders provider names and footer usage', () => {
    render(<HomeSystemHealthPanel {...makeProps()} />);
    expect(screen.getByText('Claude')).toBeTruthy();
    expect(screen.getByText('Codex')).toBeTruthy();
    expect(screen.getByText('Gemini')).toBeTruthy();
    expect(screen.getByText('5.1 GB used')).toBeTruthy();
  });

  test('calls onOpenProvider with the clicked provider', () => {
    const onOpenProvider = mock(() => {});
    const props = makeProps({ onOpenProvider });
    render(<HomeSystemHealthPanel {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Claude connected/ }));
    expect(onOpenProvider).toHaveBeenCalledWith(props.providers[0]);
  });

  test('applies status-specific classes', () => {
    render(<HomeSystemHealthPanel {...makeProps()} />);
    expect(screen.getByText('connected').className).toContain('text-green');
    expect(screen.getByText('error').className).toContain('text-destructive');
    expect(screen.getByText('disconnected').className).toContain('text-muted-foreground');
  });

  test('renders the shell when there are no providers', () => {
    render(<HomeSystemHealthPanel {...makeProps({ providers: [] })} />);
    expect(screen.getByText('5.1 GB used')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
