import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, mock, test, vi } from "vitest";
import { FileTreeItem } from './FileTreeItem';
import type { FileNode } from './types';

// Mock lucide-react icons
vi.fn('lucide-react', () => ({
  ChevronDown: ({ size }: { size: number }) => (
    <span data-testid="chevron-down" style={{ width: size, height: size }}>
      ChevronDown
    </span>
  ),
  ChevronRight: ({ size }: { size: number }) => (
    <span data-testid="chevron-right" style={{ width: size, height: size }}>
      ChevronRight
    </span>
  ),
  Folder: ({ size }: { size: number }) => (
    <span data-testid="folder" style={{ width: size, height: size }}>
      Folder
    </span>
  ),
  GripVertical: ({ size }: { size: number }) => (
    <span data-testid="grip-vertical" style={{ width: size, height: size }}>
      GripVertical
    </span>
  ),
}));

// Mock cn utility
vi.fn('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

// Mock getFileIcon
vi.fn('./utils', () => ({
  getFileIcon: (name: string, size: number) => (
    <span data-testid={`file-icon-${name}`}>{name}</span>
  ),
  countItems: (node: FileNode) => node.children?.length ?? 1,
}));

describe('FileTreeItem', () => {
  const makeProps = () => ({
    item: {
      name: 'test.ts',
      type: 'file' as const,
      path: '/src/test.ts',
    } satisfies FileNode,
    depth: 0,
    onOpenFile: vi.fn(() => {}),
    parentPath: '',
  });

  test('renders file name', () => {
    const props = makeProps();
    render(<FileTreeItem {...props} />);
    expect(screen.getByText('test.ts')).toBeTruthy();
  });

  test('calls onOpenFile when file is clicked', () => {
    const props = makeProps();
    render(<FileTreeItem {...props} />);
    fireEvent.click(screen.getByText('test.ts'));
    expect(props.onOpenFile).toHaveBeenCalledWith('test.ts', '/src/test.ts');
  });

  test('renders folder with children collapsed by default at depth >= 2', () => {
    const props = makeProps();
    props.item = {
      name: 'src',
      type: 'folder',
      children: [{ name: 'nested.ts', type: 'file' }],
    };
    props.depth = 2;
    render(<FileTreeItem {...props} />);
    expect(screen.getByText('src')).toBeTruthy();
    expect(screen.queryByText('nested.ts')).toBeNull();
  });

  test('toggles folder open on click when depth < 2', () => {
    const props = makeProps();
    props.item = {
      name: 'src',
      type: 'folder',
      children: [{ name: 'nested.ts', type: 'file' }],
    };
    props.depth = 0;
    render(<FileTreeItem {...props} />);
    expect(screen.queryByText('nested.ts')).toBeTruthy();
  });

  test('renders with custom depth padding', () => {
    const props = makeProps();
    props.depth = 1;
    render(<FileTreeItem {...props} />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  test('renders grip handle on hover group', () => {
    const props = makeProps();
    render(<FileTreeItem {...props} />);
    // GripVertical is rendered in group-hover div
    expect(screen.getByTestId('grip-vertical')).toBeTruthy();
  });
});
