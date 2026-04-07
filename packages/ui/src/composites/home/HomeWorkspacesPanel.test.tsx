// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HomeWorkspacesPanel } from './HomeWorkspacesPanel';
import type { HomeWorkspaceItem } from './types';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Circle: ({ className }: { size?: number; className: string }) => (
    <svg data-testid="circle-icon" className={className} />
  ),
}));

const mockWorkspaces: HomeWorkspaceItem[] = [
  { name: 'project-alpha', branch: 'main', disk: '1.2GB', pending: false },
  { name: 'feature-auth', branch: 'auth-42', disk: '340MB', pending: true },
  { name: 'bugfix-ui', branch: 'fix/ui', disk: '89MB', pending: false },
];

describe('HomeWorkspacesPanel', () => {
  test('renders section header', () => {
    render(<HomeWorkspacesPanel workspaces={[]} onViewAll={vi.fn()} onOpenWorkspace={vi.fn()} />);
    expect(screen.getByText('Active Workspaces')).toBeTruthy();
  });

  test('renders View all button', () => {
    render(<HomeWorkspacesPanel workspaces={[]} onViewAll={vi.fn()} onOpenWorkspace={vi.fn()} />);
    expect(screen.getByText('View all →')).toBeTruthy();
  });

  test('renders workspace list headers', () => {
    render(
      <HomeWorkspacesPanel
        workspaces={mockWorkspaces}
        onViewAll={vi.fn()}
        onOpenWorkspace={vi.fn()}
      />,
    );
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Branch')).toBeTruthy();
    expect(screen.getByText('Disk')).toBeTruthy();
  });

  test('renders workspace items with correct data', () => {
    render(
      <HomeWorkspacesPanel
        workspaces={mockWorkspaces}
        onViewAll={vi.fn()}
        onOpenWorkspace={vi.fn()}
      />,
    );
    expect(screen.getByText('project-alpha')).toBeTruthy();
    expect(screen.getByText('feature-auth')).toBeTruthy();
    expect(screen.getByText('bugfix-ui')).toBeTruthy();
  });

  test('calls onViewAll when View all clicked', () => {
    const onViewAll = vi.fn();
    render(
      <HomeWorkspacesPanel
        workspaces={mockWorkspaces}
        onViewAll={onViewAll}
        onOpenWorkspace={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('View all →'));
    expect(onViewAll).toHaveBeenCalled();
  });

  test('calls onOpenWorkspace with workspace when row clicked', () => {
    const onOpenWorkspace = vi.fn();
    render(
      <HomeWorkspacesPanel
        workspaces={mockWorkspaces}
        onViewAll={vi.fn()}
        onOpenWorkspace={onOpenWorkspace}
      />,
    );
    fireEvent.click(screen.getByText('project-alpha'));
    expect(onOpenWorkspace).toHaveBeenCalledWith(mockWorkspaces[0]);
  });

  test('renders pending indicator for workspaces with pending changes', () => {
    render(
      <HomeWorkspacesPanel
        workspaces={mockWorkspaces}
        onViewAll={vi.fn()}
        onOpenWorkspace={vi.fn()}
      />,
    );
    const circles = screen.getAllByTestId('circle-icon');
    expect(circles.length).toBe(1); // Only feature-auth has pending
  });
});
