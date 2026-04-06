import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { RateLimitsMenu } from './RateLimitsMenu';

function renderMenu(open = false) {
  const handlers = {
    onToggle: vi.fn(() => {}),
    onClose: vi.fn(() => {}),
  };
  const result = render(<RateLimitsMenu open={open} {...handlers} />);
  return { ...result, ...handlers };
}

describe('RateLimitsMenu', () => {
  test('renders the trigger button', () => {
    const { container } = renderMenu();
    expect(container).toBeTruthy();
  });

  test('shows percentage values in trigger', () => {
    renderMenu();
    // Should show remaining percentage for each provider
    // Anthropic: 142/1000 = 14.2% used -> 86% remaining
    expect(screen.getByText('86%')).toBeTruthy();
  });

  test('does not show dropdown when closed', () => {
    renderMenu(false);
    expect(screen.queryByText('Rate Limits by Provider')).toBeNull();
  });

  test('shows dropdown when open', () => {
    renderMenu(true);
    expect(screen.getByText('Rate Limits by Provider')).toBeTruthy();
  });

  test('shows provider names in dropdown', () => {
    renderMenu(true);
    expect(screen.getByText('Anthropic')).toBeTruthy();
    expect(screen.getByText('OpenAI')).toBeTruthy();
    expect(screen.getByText('Google')).toBeTruthy();
  });

  test('shows model names in dropdown', () => {
    renderMenu(true);
    expect(screen.getByText('Claude 4 Sonnet')).toBeTruthy();
    expect(screen.getByText('GPT-5.4')).toBeTruthy();
    expect(screen.getByText('Gemini 2.5 Pro')).toBeTruthy();
  });

  test('shows used/limit stats', () => {
    renderMenu(true);
    expect(screen.getByText('142 used')).toBeTruthy();
    expect(screen.getByText('1000 limit')).toBeTruthy();
  });

  test('shows remaining counts', () => {
    renderMenu(true);
    expect(screen.getByText('858 remaining')).toBeTruthy();
    expect(screen.getByText('462 remaining')).toBeTruthy();
    expect(screen.getByText('293 remaining')).toBeTruthy();
  });

  test('shows reset times', () => {
    renderMenu(true);
    expect(screen.getByText('resets in 47m')).toBeTruthy();
    expect(screen.getByText('resets in 2h 12m')).toBeTruthy();
    expect(screen.getByText('resets in 4h 31m')).toBeTruthy();
  });

  test('shows severity labels', () => {
    renderMenu(true);
    // All providers are under 50% usage, so they should show "Safe"
    const safeLabels = screen.getAllByText('Safe');
    expect(safeLabels.length).toBeGreaterThanOrEqual(1);
  });

  test('shows total usage percentage', () => {
    renderMenu(true);
    // Total: (142 + 38 + 7) / (1000 + 500 + 300) = 187/1800 = ~10%
    expect(screen.getByText(/10% used/)).toBeTruthy();
  });

  test('calls onToggle when button is clicked', () => {
    const { onToggle } = renderMenu(false);
    // Click the trigger button area
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onToggle).toHaveBeenCalled();
  });
});
