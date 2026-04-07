import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AutopilotStoryList } from './AutopilotStoryList';
import type { AutopilotStoryStep } from './types';

const steps: AutopilotStoryStep[] = [
  { label: 'Analyze existing auth', status: 'done', tokens: '1.2k' },
  { label: 'Design JWT structure', status: 'in_progress', tokens: '0.8k' },
  { label: 'Implement token issuer', status: 'pending', tokens: '—' },
  { label: 'Clean up old store', status: 'blocked', tokens: '—' },
];

describe('AutopilotStoryList', () => {
  test('renders Story Breakdown heading', () => {
    render(<AutopilotStoryList steps={steps} />);
    expect(screen.getByText('Story Breakdown')).toBeTruthy();
  });

  test('renders all step labels', () => {
    render(<AutopilotStoryList steps={steps} />);
    expect(screen.getByText('Analyze existing auth')).toBeTruthy();
    expect(screen.getByText('Design JWT structure')).toBeTruthy();
    expect(screen.getByText('Implement token issuer')).toBeTruthy();
    expect(screen.getByText('Clean up old store')).toBeTruthy();
  });

  test('renders token counts for each step', () => {
    render(<AutopilotStoryList steps={steps} />);
    expect(screen.getByText('1.2k')).toBeTruthy();
    expect(screen.getByText('0.8k')).toBeTruthy();
  });

  test('applies line-through for done steps', () => {
    render(<AutopilotStoryList steps={steps} />);
    const doneLabel = screen.getByText('Analyze existing auth');
    expect(doneLabel.className).toContain('line-through');
  });

  test('applies font-medium for in-progress steps', () => {
    render(<AutopilotStoryList steps={steps} />);
    const inProgressLabel = screen.getByText('Design JWT structure');
    expect(inProgressLabel.className).toContain('font-medium');
  });

  test('renders empty list without error', () => {
    const { container } = render(<AutopilotStoryList steps={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
