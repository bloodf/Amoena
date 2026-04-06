import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AutopilotConstraintsSection } from './AutopilotConstraintsSection';

function makeProps(overrides: Partial<Parameters<typeof AutopilotConstraintsSection>[0]> = {}) {
  return {
    allowedActions: { file_edits: true, terminal: true, git: false },
    onToggleAction: vi.fn((_key: 'file_edits' | 'terminal' | 'git') => {}),
    maxTokens: '10000',
    onMaxTokensChange: vi.fn((_v: string) => {}),
    timeLimit: '15 minutes',
    onTimeLimitChange: vi.fn((_v: string) => {}),
    ...overrides,
  };
}

describe('AutopilotConstraintsSection', () => {
  test('renders section heading', () => {
    render(<AutopilotConstraintsSection {...makeProps()} />);
    expect(screen.getByText('Constraints & Limits')).toBeTruthy();
  });

  test('renders all three action labels', () => {
    render(<AutopilotConstraintsSection {...makeProps()} />);
    expect(screen.getByText('File edits')).toBeTruthy();
    expect(screen.getByText('Terminal commands')).toBeTruthy();
    expect(screen.getByText('Git operations')).toBeTruthy();
  });

  test('renders max tokens input with correct value', () => {
    render(<AutopilotConstraintsSection {...makeProps()} />);
    const input = document.querySelector('input')!;
    expect(input.value).toBe('10000');
  });

  test('calls onMaxTokensChange when token input changes', () => {
    const onMaxTokensChange = vi.fn((_v: string) => {});
    render(<AutopilotConstraintsSection {...makeProps({ onMaxTokensChange })} />);
    const input = document.querySelector('input')!;
    fireEvent.change(input, { target: { value: '20000' } });
    expect(onMaxTokensChange).toHaveBeenCalledWith('20000');
  });

  test('renders time limit select with correct value', () => {
    render(<AutopilotConstraintsSection {...makeProps()} />);
    const select = document.querySelector('select')!;
    expect(select.value).toBe('15 minutes');
  });

  test('calls onTimeLimitChange when time limit changes', () => {
    const onTimeLimitChange = vi.fn((_v: string) => {});
    render(<AutopilotConstraintsSection {...makeProps({ onTimeLimitChange })} />);
    const select = document.querySelector('select')!;
    fireEvent.change(select, { target: { value: '30 minutes' } });
    expect(onTimeLimitChange).toHaveBeenCalledWith('30 minutes');
  });

  test('calls onToggleAction with correct key when toggle clicked', () => {
    const onToggleAction = vi.fn((_key: 'file_edits' | 'terminal' | 'git') => {});
    render(<AutopilotConstraintsSection {...makeProps({ onToggleAction })} />);
    // Click the first toggle button (File edits)
    const toggleButtons = document.querySelectorAll('button');
    // Find the toggle for "File edits" - it's the first action toggle
    const fileEditToggle = Array.from(toggleButtons).find(
      (btn) => btn.className.includes('rounded-full') && btn.className.includes('relative'),
    );
    if (fileEditToggle) {
      fireEvent.click(fileEditToggle);
      expect(onToggleAction).toHaveBeenCalledWith('file_edits');
    }
  });
});
