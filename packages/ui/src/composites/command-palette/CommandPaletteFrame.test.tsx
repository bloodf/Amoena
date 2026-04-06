import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { CommandPaletteFrame } from './CommandPaletteFrame';

function renderFrame(isClosing = false) {
  const onClose = vi.fn(() => {});
  const onKeyDown = vi.fn((_e: React.KeyboardEvent) => {});
  const result = render(
    <CommandPaletteFrame isClosing={isClosing} onClose={onClose} onKeyDown={onKeyDown}>
      <div data-testid="child-content">Content</div>
    </CommandPaletteFrame>,
  );
  return { ...result, onClose, onKeyDown };
}

describe('CommandPaletteFrame', () => {
  test('renders children', () => {
    renderFrame();
    expect(screen.getByTestId('child-content')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  test('calls onClose when backdrop is clicked', () => {
    const { onClose } = renderFrame();
    // Click the outer overlay div
    const overlay = screen.getByText('Content').closest("[class*='fixed']");
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test('does not close when inner content is clicked', () => {
    const { onClose } = renderFrame();
    fireEvent.click(screen.getByText('Content'));
    // stopPropagation on inner container should prevent close
    expect(onClose).not.toHaveBeenCalled();
  });

  test('applies closing animation classes when isClosing is true', () => {
    const { container } = renderFrame(true);
    expect(container.innerHTML).toContain('opacity-0');
  });

  test('applies open animation classes when isClosing is false', () => {
    const { container } = renderFrame(false);
    expect(container.innerHTML).toContain('opacity-100');
  });

  test('calls onKeyDown on keydown events', () => {
    const { onKeyDown } = renderFrame();
    const content = screen.getByText('Content').closest("[class*='relative']");
    if (content) fireEvent.keyDown(content, { key: 'Escape' });
    expect(onKeyDown).toHaveBeenCalled();
  });
});
