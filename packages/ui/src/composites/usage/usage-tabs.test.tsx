import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { UsageTabs } from './UsageTabs';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'api', label: 'API Log' },
];

describe('UsageTabs', () => {
  test('renders all tab labels', () => {
    render(<UsageTabs tabs={tabs} activeTab="overview" onChange={vi.fn(() => {})} />);
    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Sessions')).toBeTruthy();
    expect(screen.getByText('API Log')).toBeTruthy();
  });

  test('highlights active tab with primary border', () => {
    render(<UsageTabs tabs={tabs} activeTab="sessions" onChange={vi.fn(() => {})} />);
    const sessionsBtn = screen.getByText('Sessions');
    expect(sessionsBtn.className).toContain('border-primary');
  });

  test('inactive tabs have transparent border', () => {
    render(<UsageTabs tabs={tabs} activeTab="sessions" onChange={vi.fn(() => {})} />);
    const overviewBtn = screen.getByText('Overview');
    expect(overviewBtn.className).toContain('border-transparent');
  });

  test('calls onChange with tab id when clicked', () => {
    const onChange = vi.fn((_id: string) => {});
    render(<UsageTabs tabs={tabs} activeTab="overview" onChange={onChange} />);
    fireEvent.click(screen.getByText('API Log'));
    expect(onChange).toHaveBeenCalledWith('api');
  });

  test('renders empty when no tabs', () => {
    const { container } = render(<UsageTabs tabs={[]} activeTab="" onChange={vi.fn(() => {})} />);
    expect(container.querySelector('button')).toBeNull();
  });
});
