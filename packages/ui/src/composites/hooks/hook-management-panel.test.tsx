import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HookManagementPanel } from './HookManagementPanel';

const hooks = [
  {
    id: 'h1',
    eventName: 'SessionStart',
    handlerType: 'command',
    handlerConfig: { command: 'echo session started' },
    enabled: true,
    priority: 100,
    timeoutMs: 30000,
  },
  {
    id: 'h2',
    eventName: 'PreToolUse',
    handlerType: 'http',
    handlerConfig: { url: 'https://hooks.example.com/pre' },
    enabled: true,
    priority: 50,
    timeoutMs: 10000,
  },
  {
    id: 'h3',
    eventName: 'ErrorUnhandled',
    handlerType: 'prompt',
    handlerConfig: { text: 'An error occurred' },
    enabled: false,
    priority: 200,
    timeoutMs: 5000,
  },
];

function makeHandlers() {
  return {
    onDelete: vi.fn(() => {}),
    onFire: vi.fn(() => {}),
  };
}

describe('HookManagementPanel', () => {
  test('shows empty state when no hooks', () => {
    render(<HookManagementPanel hooks={[]} {...makeHandlers()} />);
    const paras = document.querySelectorAll('p');
    expect(paras.length).toBeGreaterThan(0);
  });

  test('renders hook list with event names', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    expect(screen.getByText('SessionStart')).toBeTruthy();
    expect(screen.getByText('PreToolUse')).toBeTruthy();
    expect(screen.getByText('ErrorUnhandled')).toBeTruthy();
  });

  test('shows handler type badge', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    expect(screen.getByText('command')).toBeTruthy();
    expect(screen.getByText('http')).toBeTruthy();
    expect(screen.getByText('prompt')).toBeTruthy();
  });

  test('calls onDelete when Delete clicked', () => {
    const handlers = makeHandlers();
    render(<HookManagementPanel hooks={hooks} {...handlers} />);
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.toLowerCase().includes('delete'));
    fireEvent.click(deleteButtons[0]);
    expect(handlers.onDelete).toHaveBeenCalledWith('h1');
  });

  test('calls onFire when Test clicked', () => {
    const handlers = makeHandlers();
    render(<HookManagementPanel hooks={hooks} {...handlers} />);
    const testButtons = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.toLowerCase().includes('test'));
    fireEvent.click(testButtons[0]);
    expect(handlers.onFire).toHaveBeenCalledWith('SessionStart');
  });

  test('shows available events section', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    // Group labels from eventGroups
    expect(screen.getByText(/Session:/)).toBeTruthy();
    expect(screen.getByText(/Tools:/)).toBeTruthy();
  });

  test('shows disabled label for disabled hook', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    // h3 is disabled; component renders t("hooks.disabled")
    const disabledEls = screen.getAllByText(/disabled|hooks\.disabled/i);
    expect(disabledEls.length).toBeGreaterThan(0);
  });

  test('renders command handler label', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    expect(screen.getByText('echo session started')).toBeTruthy();
  });

  test('renders http handler url', () => {
    render(<HookManagementPanel hooks={hooks} {...makeHandlers()} />);
    expect(screen.getByText('https://hooks.example.com/pre')).toBeTruthy();
  });
});
