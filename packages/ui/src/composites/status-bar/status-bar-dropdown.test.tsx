import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { StatusBarDropdown } from './StatusBarDropdown';

describe('StatusBarDropdown', () => {
  test('renders nothing when closed', () => {
    const { container } = render(
      <StatusBarDropdown open={false} onClose={vi.fn(() => {})}>
        <span>content</span>
      </StatusBarDropdown>,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders children when open', () => {
    render(
      <StatusBarDropdown open={true} onClose={vi.fn(() => {})}>
        <span>visible content</span>
      </StatusBarDropdown>,
    );
    expect(screen.getByText('visible content')).toBeTruthy();
  });

  test('calls onClose when clicking outside', () => {
    const onClose = vi.fn(() => {});
    render(
      <StatusBarDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </StatusBarDropdown>,
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  test('does not call onClose when clicking inside', () => {
    const onClose = vi.fn(() => {});
    render(
      <StatusBarDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </StatusBarDropdown>,
    );
    fireEvent.mouseDown(screen.getByText('inside'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('applies custom className', () => {
    const { container } = render(
      <StatusBarDropdown open={true} onClose={vi.fn(() => {})} className="custom-class">
        <span>test</span>
      </StatusBarDropdown>,
    );
    expect((container.firstChild as HTMLElement).className).toContain('custom-class');
  });
});
