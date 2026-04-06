import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useMarketplaceState } from './useMarketplaceState';
import type { MarketplaceItem } from './types';

const sampleItems: MarketplaceItem[] = [
  {
    id: 'ext-1',
    name: 'Code Formatter',
    desc: 'Auto-format code on save',
    author: 'amoena-team',
    category: 'Extensions',
    tags: ['formatting', 'linting'],
    installed: false,
    trusted: true,
    featured: true,
    rating: 4.8,
    installs: '1K+',
    installCount: 1200,
    lastUpdated: '2025-03-01',
    permissions: ['read'],
    signed: true,
    compatibility: 'desktop',
    version: '1.2.0',
  },
  {
    id: 'ext-2',
    name: 'Security Scanner',
    desc: 'Scan code for vulnerabilities',
    author: 'community',
    category: 'Extensions',
    tags: ['security', 'audit'],
    installed: true,
    trusted: false,
    featured: false,
    rating: 4.2,
    installs: '500+',
    installCount: 500,
    lastUpdated: '2025-02-15',
    permissions: ['read', 'write'],
    signed: false,
    compatibility: 'desktop',
    version: '0.9.1',
  },
  {
    id: 'ext-3',
    name: 'Git Helper',
    desc: 'Enhanced git operations',
    author: 'amoena-team',
    category: 'Extensions',
    tags: ['git', 'vcs'],
    installed: false,
    trusted: true,
    featured: false,
    rating: 4.5,
    installs: '800+',
    installCount: 800,
    lastUpdated: '2025-02-20',
    permissions: ['read'],
    signed: true,
    compatibility: 'desktop',
    version: '2.0.0',
  },
];

describe('useMarketplaceState', () => {
  test('initial state returns all items sorted by popularity', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    expect(result.current.filtered).toHaveLength(3);
    expect(result.current.filtered[0].name).toBe('Code Formatter');
    expect(result.current.activeCategory).toBe('All');
    expect(result.current.sortBy).toBe('popular');
  });

  test('filters by category', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setActiveCategory('Extensions');
    });

    expect(result.current.filtered).toHaveLength(3);
    expect(result.current.filtered[0].name).toBe('Code Formatter');
  });

  test('filters by installed', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setShowInstalled(true);
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Security Scanner');
  });

  test('filters by search query', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setSearchQuery('git');
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Git Helper');
  });

  test('filters by trust level', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setTrustFilter('unverified');
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Security Scanner');
  });

  test('filters by author', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setAuthorFilter('official');
    });

    expect(result.current.filtered).toHaveLength(2);
  });

  test('sorts by name', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setSortBy('name');
    });

    expect(result.current.filtered[0].name).toBe('Code Formatter');
    expect(result.current.filtered[1].name).toBe('Git Helper');
    expect(result.current.filtered[2].name).toBe('Security Scanner');
  });

  test('sorts by rating', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setSortBy('rating');
    });

    expect(result.current.filtered[0].rating).toBe(4.8);
    expect(result.current.filtered[2].rating).toBe(4.2);
  });

  test('handleInstall marks item as installed', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.handleInstall(sampleItems[0]);
    });

    const installed = result.current.items.find((i) => i.id === 'ext-1');
    expect(installed?.installed).toBe(true);
  });

  test('handleUninstall marks item as not installed', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.handleUninstall(sampleItems[1]);
    });

    const item = result.current.items.find((i) => i.id === 'ext-2');
    expect(item?.installed).toBe(false);
  });

  test('clearFilters resets all filters', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setTrustFilter('trusted');
      result.current.setAuthorFilter('official');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.trustFilter).toBe('all');
    expect(result.current.authorFilter).toBe('all');
    expect(result.current.hasActiveFilters).toBe(false);
  });

  test('featuredItems returns only featured and not installed items', () => {
    const { result } = renderHook(() => useMarketplaceState([...sampleItems]));

    expect(result.current.featuredItems).toHaveLength(1);
    expect(result.current.featuredItems[0].name).toBe('Code Formatter');
  });
});
