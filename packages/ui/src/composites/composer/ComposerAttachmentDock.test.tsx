import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const Icon = () => <svg data-testid="icon" />;

vi.mock('lucide-react', () => ({
  File: Icon,
  Folder: Icon,
  X: Icon,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...values: unknown[]) => values.flat(Infinity).filter(Boolean).join(' '),
}));

const { ComposerAttachmentDock } = await import('./ComposerAttachmentDock');
import type { ComposerAttachment } from './types';

function makeProps(overrides: Partial<Parameters<typeof ComposerAttachmentDock>[0]> = {}) {
  return {
    attachments: [],
    onRemove: vi.fn(() => {}),
    ...overrides,
  };
}

const fileAttachment: ComposerAttachment = {
  type: 'file',
  name: 'tokens.rs',
  path: 'src/auth/tokens.rs',
};
const folderAttachment: ComposerAttachment = {
  type: 'folder',
  name: 'auth',
  path: 'src/auth',
  itemCount: 5,
};

describe('ComposerAttachmentDock', () => {
  test('renders nothing when there are no attachments', () => {
    const { container } = render(<ComposerAttachmentDock {...makeProps()} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders file and folder attachments', () => {
    render(
      <ComposerAttachmentDock
        {...makeProps({ attachments: [fileAttachment, folderAttachment] })}
      />,
    );
    expect(screen.getByText('tokens.rs')).toBeTruthy();
    expect(screen.getByText('src/auth')).toBeTruthy();
    expect(screen.getByText('(5 items)')).toBeTruthy();
  });

  test('hides folder count when itemCount is missing', () => {
    render(
      <ComposerAttachmentDock
        {...makeProps({ attachments: [{ type: 'folder', name: 'auth', path: 'src/auth' }] })}
      />,
    );
    expect(screen.queryByText(/items\)/)).toBeNull();
  });

  test('calls onRemove with the attachment path', () => {
    const onRemove = vi.fn((_path: string) => {});
    render(<ComposerAttachmentDock {...makeProps({ attachments: [fileAttachment], onRemove })} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledWith('src/auth/tokens.rs');
  });
});
