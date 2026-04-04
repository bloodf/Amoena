import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, mock, test, vi } from "vitest";
import { HomeWorkspacesPanel } from './HomeWorkspacesPanel';

vi.mock('lucide-react', () => ({
  Circle: ({ size }: { size: number }) => (
    <span data-testid="circle" style={{ width: size, height: size }} />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

function makeProps(overrides: Partial<Parameters<typeof HomeWorkspacesPanel>[0]> = {}) {
  return {
    workspaces: [
      { name: 'app-shell', branch: 'main', disk: '1.2 GB', pending: true },
      { name: 'feature-a', branch: 'feat/a', disk: '860 MB', pending: false },
    ],
    onViewAll: vi.fn(() => {}),
    onOpenWorkspace: vi.fn(() => {}),
    ...overrides,
  };
}

describe('HomeWorkspacesPanel', () => {
  test('renders the table headings and workspaces', () => {
    render(<HomeWorkspacesPanel {...makeProps()} />);
    expect(screen.getByText('Active Workspaces')).toBeTruthy();
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Branch')).toBeTruthy();
    expect(screen.getByText('Disk')).toBeTruthy();
    expect(screen.getByText('app-shell')).toBeTruthy();
    expect(screen.getByText('feature-a')).toBeTruthy();
  });

  test('calls onViewAll when the header action is clicked', () => {
    const onViewAll = vi.fn(() => {});
    render(<HomeWorkspacesPanel {...makeProps({ onViewAll })} />);
    fireEvent.click(screen.getByRole('button', { name: 'View all →' }));
    expect(onViewAll).toHaveBeenCalled();
  });

  test('calls onOpenWorkspace with the clicked workspace', () => {
    const onOpenWorkspace = vi.fn(() => {});
    const props = makeProps({ onOpenWorkspace });
    render(<HomeWorkspacesPanel {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /app-shell main 1.2 GB/ }));
    expect(onOpenWorkspace).toHaveBeenCalledWith(props.workspaces[0]);
  });

  test('shows a pending indicator only for pending workspaces', () => {
    render(<HomeWorkspacesPanel {...makeProps()} />);
    expect(screen.getByTestId('circle')).toBeTruthy();
  });

  test('renders an empty workspace list without row buttons', () => {
    render(<HomeWorkspacesPanel {...makeProps({ workspaces: [] })} />);
    expect(screen.getByText('Active Workspaces')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /app-shell/ })).toBeNull();
  });
});
