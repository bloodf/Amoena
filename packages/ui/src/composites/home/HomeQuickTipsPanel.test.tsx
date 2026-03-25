// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { HomeQuickTipsPanel } from './HomeQuickTipsPanel';
import type { HomeQuickTip } from './types';

const mockTips: HomeQuickTip[] = [
  { shortcut: '⌘K', tip: 'Open command palette' },
  { shortcut: '⌘N', tip: 'New session' },
  { shortcut: '⌘`', tip: 'Toggle terminal' },
];

describe('HomeQuickTipsPanel', () => {
  test('renders section title', () => {
    render(<HomeQuickTipsPanel tips={[]} />);
    expect(screen.getByText('Quick Tips')).toBeTruthy();
  });

  test('renders tips with shortcuts', () => {
    render(<HomeQuickTipsPanel tips={mockTips} />);
    expect(screen.getByText('⌘K')).toBeTruthy();
    expect(screen.getByText('⌘N')).toBeTruthy();
    expect(screen.getByText('⌘`')).toBeTruthy();
  });

  test('renders tip descriptions', () => {
    render(<HomeQuickTipsPanel tips={mockTips} />);
    expect(screen.getByText('Open command palette')).toBeTruthy();
    expect(screen.getByText('New session')).toBeTruthy();
    expect(screen.getByText('Toggle terminal')).toBeTruthy();
  });

  test('renders all tips correctly', () => {
    render(<HomeQuickTipsPanel tips={mockTips} />);
    const kbdElements = document.querySelectorAll('kbd');
    expect(kbdElements.length).toBe(3);
  });

  test('renders empty tips array', () => {
    render(<HomeQuickTipsPanel tips={[]} />);
    expect(screen.getByText('Quick Tips')).toBeTruthy();
    const kbdElements = document.querySelectorAll('kbd');
    expect(kbdElements.length).toBe(0);
  });
});
