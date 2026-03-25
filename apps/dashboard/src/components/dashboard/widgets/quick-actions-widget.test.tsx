// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuickActionsWidget } from './quick-actions-widget';

vi.mock('../widget-primitives', async () => {
  const actual = await vi.importActual('../widget-primitives');
  return {
    ...actual,
    LogActionIcon: () => <span data-testid="log-icon" />,
    MemoryActionIcon: () => <span data-testid="memory-icon" />,
    PipelineActionIcon: () => <span data-testid="pipeline-icon" />,
    QuickAction: ({ label, onNavigate }: any) => (
      <button
        type="button"
        data-testid={`action-${label.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => onNavigate?.('test')}
      >
        {label}
      </button>
    ),
    SessionIcon: () => <span data-testid="session-icon" />,
    SpawnActionIcon: () => <span data-testid="spawn-icon" />,
    TaskActionIcon: () => <span data-testid="task-icon" />,
  };
});

afterEach(() => cleanup());

const mockData = {
  isLocal: false,
  navigateToPanel: vi.fn(),
} as any;

describe('QuickActionsWidget', () => {
  it('renders 5 quick actions in local mode', () => {
    render(<QuickActionsWidget data={{ ...mockData, isLocal: true }} />);
    expect(screen.getByTestId('action-view-logs')).toBeDefined();
    expect(screen.getByTestId('action-task-board')).toBeDefined();
    expect(screen.getByTestId('action-memory')).toBeDefined();
    expect(screen.getByTestId('action-sessions')).toBeDefined();
  });

  it('renders 5 quick actions in gateway mode', () => {
    render(<QuickActionsWidget data={mockData} />);
    expect(screen.getByTestId('action-spawn-agent')).toBeDefined();
    expect(screen.getByTestId('action-view-logs')).toBeDefined();
    expect(screen.getByTestId('action-task-board')).toBeDefined();
    expect(screen.getByTestId('action-memory')).toBeDefined();
    expect(screen.getByTestId('action-orchestration')).toBeDefined();
  });

  it('hides spawn agent in local mode', () => {
    render(<QuickActionsWidget data={{ ...mockData, isLocal: true }} />);
    expect(screen.queryByTestId('action-spawn-agent')).toBeNull();
  });

  it('calls navigateToPanel on click', () => {
    render(<QuickActionsWidget data={mockData} />);
    fireEvent.click(screen.getByTestId('action-view-logs'));
    expect(mockData.navigateToPanel).toHaveBeenCalledWith('test');
  });
});
