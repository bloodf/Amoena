import { useMemo, useState } from 'react';

import type {
  AuthorFilter,
  MarketplaceCategory,
  MarketplaceItem,
  SortOption,
  TrustFilter,
} from './types';

export function useMarketplaceState(initialItems: MarketplaceItem[]) {
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>('All');
  const [showInstalled, setShowInstalled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [trustFilter, setTrustFilter] = useState<TrustFilter>('all');
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [reviewItem, setReviewItem] = useState<MarketplaceItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = items;

    if (showInstalled) {
      result = result.filter((item) => item.installed);
    } else if (activeCategory !== 'All') {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const normalized = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.desc.toLowerCase().includes(normalized) ||
          item.author.toLowerCase().includes(normalized) ||
          item.tags.some((tag) => tag.toLowerCase().includes(normalized)),
      );
    }

    if (trustFilter === 'trusted') result = result.filter((item) => item.trusted);
    if (trustFilter === 'unverified') result = result.filter((item) => !item.trusted);

    if (authorFilter === 'official')
      result = result.filter((item) => item.author === 'amoena-team');
    if (authorFilter === 'community') result = result.filter((item) => item.author === 'community');

    return [...result].sort((left, right) => {
      if (sortBy === 'popular') return right.installCount - left.installCount;
      if (sortBy === 'recent') return right.lastUpdated.localeCompare(left.lastUpdated);
      if (sortBy === 'name') return left.name.localeCompare(right.name);
      if (sortBy === 'rating') return right.rating - left.rating;
      return 0;
    });
  }, [activeCategory, authorFilter, items, searchQuery, showInstalled, sortBy, trustFilter]);

  const featuredItems = useMemo(
    () => items.filter((item) => item.featured && !item.installed),
    [items],
  );
  const hasActiveFilters =
    trustFilter !== 'all' || authorFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setTrustFilter('all');
    setAuthorFilter('all');
    setSortBy('popular');
  };

  const handleInstall = (item: MarketplaceItem) => {
    setItems((previous) =>
      previous.map((entry) => (entry.id === item.id ? { ...entry, installed: true } : entry)),
    );
    setReviewItem(null);
    if (selectedItem?.id === item.id) setSelectedItem({ ...item, installed: true });
  };

  const handleUninstall = (item: MarketplaceItem) => {
    setItems((previous) =>
      previous.map((entry) => (entry.id === item.id ? { ...entry, installed: false } : entry)),
    );
    if (selectedItem?.id === item.id) setSelectedItem({ ...item, installed: false });
  };

  return {
    items,
    activeCategory,
    setActiveCategory,
    showInstalled,
    setShowInstalled,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    trustFilter,
    setTrustFilter,
    authorFilter,
    setAuthorFilter,
    showFilters,
    setShowFilters,
    reviewItem,
    setReviewItem,
    selectedItem,
    setSelectedItem,
    viewMode,
    setViewMode,
    filtered,
    featuredItems,
    hasActiveFilters,
    clearFilters,
    handleInstall,
    handleUninstall,
  };
}
