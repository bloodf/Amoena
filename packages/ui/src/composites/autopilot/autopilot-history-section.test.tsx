import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AutopilotHistorySection } from './AutopilotHistorySection';
import type { AutopilotRunHistoryItem } from './types';

const historyItem: AutopilotRunHistoryItem = {
  id: 'run-1',
  goal: 'Fix WebSocket reconnect',
  state: 'complete',
  steps: 4,
  completed: 4,
  tokens: '8.2k',
  duration: '6m 33s',
  startedAt: '9:45 AM',
};

function makeProps(overrides: Partial<Parameters<typeof AutopilotHistorySection>[0]> = {}) {
  return {
    showHistory: true,
    onToggle: vi.fn(() => {}),
    history: [historyItem],
    onSelectRun: vi.fn((_run: AutopilotRunHistoryItem) => {}),
    ...overrides,
  };
}

describe('AutopilotHistorySection', () => {
  test('renders Run History toggle', () => {
    render(<AutopilotHistorySection {...makeProps()} />);
    expect(screen.getByText('Run History')).toBeTruthy();
  });

  test('renders history items when showHistory is true', () => {
    render(<AutopilotHistorySection {...makeProps({ showHistory: true })} />);
    expect(screen.getByText('Fix WebSocket reconnect')).toBeTruthy();
  });

  test('hides history items when showHistory is false', () => {
    render(<AutopilotHistorySection {...makeProps({ showHistory: false })} />);
    expect(screen.queryByText('Fix WebSocket reconnect')).toBeNull();
  });

  test('calls onToggle when toggle button clicked', () => {
    const onToggle = vi.fn(() => {});
    render(<AutopilotHistorySection {...makeProps({ onToggle })} />);
    fireEvent.click(screen.getByText('Run History'));
    expect(onToggle).toHaveBeenCalled();
  });

  test('calls onSelectRun when a run entry is clicked', () => {
    const onSelectRun = vi.fn((_run: AutopilotRunHistoryItem) => {});
    render(<AutopilotHistorySection {...makeProps({ onSelectRun })} />);
    fireEvent.click(screen.getByText('Fix WebSocket reconnect'));
    expect(onSelectRun).toHaveBeenCalledWith(historyItem);
  });

  test('displays step count and token info', () => {
    render(<AutopilotHistorySection {...makeProps()} />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('4/4 steps');
    expect(text).toContain('8.2k');
  });
});
