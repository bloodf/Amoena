// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TaskFlowWidget } from './task-flow-widget';

afterEach(() => cleanup());

describe('TaskFlowWidget', () => {
  it('renders header', () => {
    render(
      <TaskFlowWidget
        data={
          {
            inboxCount: 0,
            assignedCount: 0,
            runningTasks: 0,
            reviewCount: 0,
            doneCount: 0,
            backlogCount: 0,
          } as any
        }
      />,
    );
    expect(screen.getByText('Task Flow')).toBeDefined();
  });

  it('renders all task flow rows with zero values', () => {
    render(
      <TaskFlowWidget
        data={
          {
            inboxCount: 0,
            assignedCount: 0,
            runningTasks: 0,
            reviewCount: 0,
            doneCount: 0,
            backlogCount: 0,
          } as any
        }
      />,
    );
    expect(screen.getByText('Inbox')).toBeDefined();
    expect(screen.getByText('Assigned')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Review')).toBeDefined();
    expect(screen.getByText('Done')).toBeDefined();
    expect(screen.getByText('Backlog')).toBeDefined();
  });

  it('renders non-zero task flow values', () => {
    render(
      <TaskFlowWidget
        data={
          {
            inboxCount: 5,
            assignedCount: 3,
            runningTasks: 2,
            reviewCount: 1,
            doneCount: 10,
            backlogCount: 8,
          } as any
        }
      />,
    );
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
  });
});
