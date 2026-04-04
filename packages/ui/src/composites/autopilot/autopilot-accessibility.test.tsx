import { render, screen } from '@testing-library/react';
import { describe, expect, test } from "vitest";
import { AutopilotActivityPane } from './AutopilotActivityPane';
import { AutopilotStatusPanel } from './AutopilotStatusPanel';
import type { AutopilotActivityItem } from './types';

const noop = () => {};

const sampleActivity: AutopilotActivityItem[] = [
  { time: '0:01', action: 'create', target: 'auth.ts', status: 'completed' },
  { time: '0:02', action: 'modify', target: 'config.ts', status: 'pending_approval' },
];

describe('AutopilotActivityPane accessibility', () => {
  test('activity log has role=log and aria-live=polite', () => {
    const { container } = render(
      <AutopilotActivityPane
        state="executing"
        activityLog={sampleActivity}
        onOpenTaskBoard={noop}
        onApprove={noop}
        onDeny={noop}
      />,
    );
    const log = container.querySelector('[role="log"]');
    expect(log).toBeTruthy();
    expect(log?.getAttribute('aria-live')).toBe('polite');
  });

  test('approve and deny buttons have descriptive aria-labels', () => {
    render(
      <AutopilotActivityPane
        state="executing"
        activityLog={sampleActivity}
        onOpenTaskBoard={noop}
        onApprove={noop}
        onDeny={noop}
      />,
    );
    expect(screen.getByLabelText('Approve config.ts')).toBeTruthy();
    expect(screen.getByLabelText('Deny config.ts')).toBeTruthy();
  });

  test('task board button has aria-label', () => {
    render(
      <AutopilotActivityPane
        state="executing"
        activityLog={[]}
        onOpenTaskBoard={noop}
        onApprove={noop}
        onDeny={noop}
      />,
    );
    expect(screen.getByLabelText('Open task board')).toBeTruthy();
  });

  test('approve/deny buttons meet minimum touch target size', () => {
    render(
      <AutopilotActivityPane
        state="executing"
        activityLog={sampleActivity}
        onOpenTaskBoard={noop}
        onApprove={noop}
        onDeny={noop}
      />,
    );
    const approveBtn = screen.getByLabelText('Approve config.ts');
    expect(approveBtn.className).toContain('min-h-[44px]');
    expect(approveBtn.className).toContain('min-w-[44px]');
  });
});

describe('AutopilotStatusPanel accessibility', () => {
  test('status indicator has role=status and aria-live=polite', () => {
    const { container } = render(
      <AutopilotStatusPanel
        enabled={true}
        state="executing"
        onToggleEnabled={noop}
        onStart={noop}
        onPause={noop}
        onStop={noop}
        onResume={noop}
        onApprove={noop}
        onDeny={noop}
        onNewRun={noop}
        onUnblock={noop}
      />,
    );
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-live')).toBe('polite');
  });

  test('switch has aria-label for autopilot toggle', () => {
    render(
      <AutopilotStatusPanel
        enabled={false}
        state="idle"
        onToggleEnabled={noop}
        onStart={noop}
        onPause={noop}
        onStop={noop}
        onResume={noop}
        onApprove={noop}
        onDeny={noop}
        onNewRun={noop}
        onUnblock={noop}
      />,
    );
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeTruthy();
    expect(switchEl.getAttribute('aria-label')).toBe('Enable autopilot');
  });
});
