import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ComposerAttachmentDock } from './ComposerAttachmentDock';
import type { ComposerAttachment } from './types';

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
  test('renders nothing when attachments is empty', () => {
    const { container } = render(
      <ComposerAttachmentDock attachments={[]} onRemove={vi.fn(() => {})} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders file attachment with name', () => {
    render(<ComposerAttachmentDock attachments={[fileAttachment]} onRemove={vi.fn(() => {})} />);
    expect(screen.getByText('tokens.rs')).toBeTruthy();
  });

  test('renders folder attachment with path', () => {
    render(<ComposerAttachmentDock attachments={[folderAttachment]} onRemove={vi.fn(() => {})} />);
    expect(screen.getByText('src/auth')).toBeTruthy();
  });

  test('renders item count for folder', () => {
    render(<ComposerAttachmentDock attachments={[folderAttachment]} onRemove={vi.fn(() => {})} />);
    expect(screen.getByText('(5 items)')).toBeTruthy();
  });

  test('calls onRemove with path when remove button clicked', () => {
    const onRemove = vi.fn((_path: string) => {});
    render(<ComposerAttachmentDock attachments={[fileAttachment]} onRemove={onRemove} />);
    const removeBtn = document.querySelector('button')!;
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith('src/auth/tokens.rs');
  });

  test('renders multiple attachments', () => {
    render(
      <ComposerAttachmentDock
        attachments={[fileAttachment, folderAttachment]}
        onRemove={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('tokens.rs')).toBeTruthy();
    expect(screen.getByText('src/auth')).toBeTruthy();
  });
});
