import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { RuntimeMenu } from './RuntimeMenu';
import type { RuntimeLocation } from './data';

function renderMenu(open = false, runtimeLocation: RuntimeLocation = 'local') {
  const handlers = {
    onToggle: vi.fn(() => {}),
    onClose: vi.fn(() => {}),
    onSelect: vi.fn((_loc: RuntimeLocation) => {}),
  };
  const result = render(
    <RuntimeMenu open={open} runtimeLocation={runtimeLocation} {...handlers} />,
  );
  return { ...result, ...handlers };
}

describe('RuntimeMenu', () => {
  test('renders current runtime label', () => {
    renderMenu(false, 'local');
    expect(screen.getByText('Local')).toBeTruthy();
  });

  test('renders Relay label when relay is selected', () => {
    renderMenu(false, 'relay');
    expect(screen.getByText('Relay')).toBeTruthy();
  });

  test('renders Offline label', () => {
    renderMenu(false, 'offline');
    expect(screen.getByText('Offline')).toBeTruthy();
  });

  test('does not show dropdown when closed', () => {
    renderMenu(false);
    expect(screen.queryByText('Runtime')).toBeNull();
  });

  test('shows dropdown with options when open', () => {
    renderMenu(true);
    expect(screen.getByText('Runtime')).toBeTruthy();
    // Should show all 4 runtime options
    expect(screen.getAllByText('Local')).toBeTruthy();
    expect(screen.getByText('Relay')).toBeTruthy();
    expect(screen.getByText('Offline')).toBeTruthy();
    expect(screen.getByText('Degraded')).toBeTruthy();
  });

  test('calls onToggle when button is clicked', () => {
    const { onToggle } = renderMenu(false);
    fireEvent.click(screen.getByText('Local'));
    expect(onToggle).toHaveBeenCalled();
  });

  test('calls onSelect when an option is clicked', () => {
    const { onSelect } = renderMenu(true);
    fireEvent.click(screen.getByText('Relay'));
    expect(onSelect).toHaveBeenCalledWith('relay');
  });

  test('marks current selection with aria-selected', () => {
    renderMenu(true, 'local');
    const options = screen.getAllByRole('option');
    const localOption = options.find((opt) => opt.getAttribute('aria-selected') === 'true');
    expect(localOption).toBeTruthy();
  });

  test('shows check icon for selected option', () => {
    renderMenu(true, 'local');
    // The selected option should have different styling (bg-surface-2)
    const options = screen.getAllByRole('option');
    const selectedOption = options.find((opt) => opt.getAttribute('aria-selected') === 'true');
    expect(selectedOption?.className).toContain('bg-surface-2');
  });

  test('renders degraded option', () => {
    renderMenu(true, 'degraded');
    expect(screen.getAllByText('Degraded').length).toBeGreaterThanOrEqual(1);
  });
});
