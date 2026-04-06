import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MarketplaceResults } from './MarketplaceResults';
import type { MarketplaceItem } from './types';

const item: MarketplaceItem = {
  id: 'item-1',
  name: 'Git Tools',
  author: 'anthropic',
  installs: '12k',
  installCount: 12000,
  desc: 'Git integration',
  category: 'Extensions',
  installed: false,
  trusted: true,
  version: '1.0.0',
  permissions: ['read:fs'],
  signed: true,
  compatibility: '>=1.0.0',
  lastUpdated: '2024-01-01',
  rating: 4.5,
  tags: ['git'],
};

function makeProps(overrides: Partial<Parameters<typeof MarketplaceResults>[0]> = {}) {
  return {
    filtered: [item],
    selectedItem: null,
    activeCategory: 'Extensions' as const,
    searchQuery: '',
    showInstalled: false,
    hasActiveFilters: false,
    viewMode: 'grid' as const,
    onSelect: vi.fn(() => {}),
    onInstallRequest: vi.fn(() => {}),
    onUninstall: vi.fn(() => {}),
    onClearFilters: vi.fn(() => {}),
    ...overrides,
  };
}

describe('MarketplaceResults', () => {
  test('renders items when filtered list is non-empty', () => {
    render(<MarketplaceResults {...makeProps()} />);
    expect(screen.getByText('Git Tools')).toBeTruthy();
  });

  test('shows empty state when filtered list is empty — branch line 33', () => {
    render(<MarketplaceResults {...makeProps({ filtered: [] })} />);
    expect(screen.getByText('No packages found')).toBeTruthy();
  });

  test('empty state shows search query message when searchQuery is set — branch line 39', () => {
    render(<MarketplaceResults {...makeProps({ filtered: [], searchQuery: 'missing-pkg' })} />);
    expect(screen.getByText(/No results for "missing-pkg"/)).toBeTruthy();
  });

  test('empty state shows No installed packages when showInstalled=true and no query — branch line 39', () => {
    render(
      <MarketplaceResults {...makeProps({ filtered: [], searchQuery: '', showInstalled: true })} />,
    );
    expect(screen.getByText('No installed packages')).toBeTruthy();
  });

  test('empty state shows category message when no query and not showInstalled — branch line 39', () => {
    render(
      <MarketplaceResults
        {...makeProps({
          filtered: [],
          searchQuery: '',
          showInstalled: false,
          activeCategory: 'Extensions',
        })}
      />,
    );
    expect(screen.getByText(/extensions match your filters/i)).toBeTruthy();
  });

  test('shows Clear filters button when hasActiveFilters=true in empty state — branch line 41', () => {
    const onClearFilters = vi.fn(() => {});
    render(
      <MarketplaceResults
        {...makeProps({ filtered: [], hasActiveFilters: true, onClearFilters })}
      />,
    );
    const btn = screen.getByText('Clear filters');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onClearFilters).toHaveBeenCalled();
  });

  test('does not show Clear filters button when hasActiveFilters=false — branch line 41', () => {
    render(<MarketplaceResults {...makeProps({ filtered: [], hasActiveFilters: false })} />);
    expect(screen.queryByText('Clear filters')).toBeNull();
  });

  test('renders grid layout when viewMode is grid — branch line 51', () => {
    const { container } = render(<MarketplaceResults {...makeProps({ viewMode: 'grid' })} />);
    expect(container.querySelector('.grid')).toBeTruthy();
  });

  test('renders list layout when viewMode is list — branch line 51', () => {
    const { container } = render(<MarketplaceResults {...makeProps({ viewMode: 'list' })} />);
    expect(container.querySelector('.space-y-2')).toBeTruthy();
  });
});
