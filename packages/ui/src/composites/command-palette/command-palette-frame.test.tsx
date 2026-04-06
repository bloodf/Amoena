import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CommandPaletteFrame } from './CommandPaletteFrame';

function makeProps(overrides: Partial<Parameters<typeof CommandPaletteFrame>[0]> = {}) {
  return {
    isClosing: false,
    onClose: vi.fn(() => {}),
    onKeyDown: vi.fn((_e: React.KeyboardEvent) => {}),
    children: <span>palette content</span>,
    ...overrides,
  };
}

describe('CommandPaletteFrame', () => {
  test('renders children', () => {
    render(<CommandPaletteFrame {...makeProps()} />);
    expect(screen.getByText('palette content')).toBeTruthy();
  });

  test('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn(() => {});
    const { container } = render(<CommandPaletteFrame {...makeProps({ onClose })} />);
    // Click the outer overlay div
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test('does not call onClose when content clicked', () => {
    const onClose = vi.fn(() => {});
    render(<CommandPaletteFrame {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByText('palette content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('applies closing animation classes when isClosing', () => {
    const { container } = render(<CommandPaletteFrame {...makeProps({ isClosing: true })} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('opacity-0');
  });

  test('applies open classes when not closing', () => {
    const { container } = render(<CommandPaletteFrame {...makeProps({ isClosing: false })} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('opacity-100');
  });
});
