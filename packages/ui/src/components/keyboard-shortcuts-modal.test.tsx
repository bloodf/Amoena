import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

describe('KeyboardShortcutsModal', () => {
  test('renders nothing when open is false', () => {
    const { container } = render(<KeyboardShortcutsModal open={false} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  test('renders the dialog when open is true', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Keyboard shortcuts');
  });

  test('displays section headings', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    expect(screen.getByText('General')).toBeTruthy();
    expect(screen.getByText('Session')).toBeTruthy();
    expect(screen.getByText('Navigation')).toBeTruthy();
    expect(screen.getByText('Terminal')).toBeTruthy();
  });

  test('displays shortcut descriptions', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Open command palette')).toBeTruthy();
    expect(screen.getByText('Send message')).toBeTruthy();
    expect(screen.getByText('Toggle terminal')).toBeTruthy();
  });

  test('close button has aria-label', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Close keyboard shortcuts')).toBeTruthy();
  });

  test('close button meets minimum touch target', () => {
    render(<KeyboardShortcutsModal open={true} onClose={() => {}} />);
    const closeBtn = screen.getByLabelText('Close keyboard shortcuts');
    expect(closeBtn.className).toContain('min-h-[44px]');
    expect(closeBtn.className).toContain('min-w-[44px]');
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn(() => {});
    render(<KeyboardShortcutsModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close keyboard shortcuts'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn(() => {});
    render(<KeyboardShortcutsModal open={true} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn(() => {});
    render(<KeyboardShortcutsModal open={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
