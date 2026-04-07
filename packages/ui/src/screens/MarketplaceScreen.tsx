import {
  type MarketplaceCategory,
  type SortOption,
  type TrustFilter,
  type AuthorFilter,
} from '../composites/marketplace/types.ts';
import { allItems as initialData, marketplaceCategories } from '../composites/marketplace/data.ts';
import { InstallReviewSheet } from '../composites/marketplace/InstallReviewSheet.tsx';
import { ItemDetailPanel } from '../composites/marketplace/ItemDetailPanel.tsx';
import { MarketplaceFeaturedSection } from '../composites/marketplace/MarketplaceFeaturedSection.tsx';
import { MarketplaceResults } from '../composites/marketplace/MarketplaceResults.tsx';
import { MarketplaceSectionHeader } from '../composites/marketplace/MarketplaceSectionHeader.tsx';
import { MarketplaceSidebar } from '../composites/marketplace/MarketplaceSidebar.tsx';
import { MarketplaceToolbar } from '../composites/marketplace/MarketplaceToolbar.tsx';
import { useMarketplaceState } from '../composites/marketplace/useMarketplaceState.ts';
import { ScreenMain, ScreenSidebarLayout } from '../components/screen.tsx';

export function MarketplaceScreen() {
  const {
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
  } = useMarketplaceState(initialData);

  const getSectionTitle = () => {
    if (showInstalled) return 'Installed';
    if (searchQuery) return 'Search Results';
    return activeCategory;
  };
  const sectionTitle = getSectionTitle();

  return (
    <ScreenSidebarLayout>
      <MarketplaceSidebar
        categories={marketplaceCategories}
        items={items}
        activeCategory={activeCategory}
        showInstalled={showInstalled}
        authorFilter={authorFilter}
        trustFilter={trustFilter}
        sortBy={sortBy}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setShowInstalled(false);
        }}
        onInstalledSelect={() => {
          setShowInstalled(true);
          setActiveCategory('All');
        }}
        onAuthorFilterToggle={() =>
          setAuthorFilter(authorFilter === 'official' ? 'all' : 'official')
        }
        onTrustFilterToggle={() => setTrustFilter(trustFilter === 'trusted' ? 'all' : 'trusted')}
        onTopRatedToggle={() => setSortBy(sortBy === 'rating' ? 'popular' : 'rating')}
      />

      <ScreenMain className="flex flex-col overflow-hidden">
        <MarketplaceToolbar
          searchQuery={searchQuery}
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          sortBy={sortBy}
          trustFilter={trustFilter}
          authorFilter={authorFilter}
          viewMode={viewMode}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSortChange={setSortBy}
          onTrustFilterChange={setTrustFilter}
          onAuthorFilterChange={setAuthorFilter}
          onViewModeChange={setViewMode}
          onClearFilters={clearFilters}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {!showInstalled &&
              activeCategory === 'All' &&
              !searchQuery &&
              featuredItems.length > 0 && (
                <MarketplaceFeaturedSection
                  items={featuredItems}
                  onSelect={(item) =>
                    setSelectedItem(items.find((entry) => entry.id === item.id) || item)
                  }
                  onInstallRequest={setReviewItem}
                />
              )}

            <MarketplaceSectionHeader title={sectionTitle} count={filtered.length} />

            <MarketplaceResults
              filtered={filtered}
              selectedItem={selectedItem}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              showInstalled={showInstalled}
              hasActiveFilters={hasActiveFilters}
              viewMode={viewMode}
              onSelect={setSelectedItem}
              onInstallRequest={setReviewItem}
              onUninstall={handleUninstall}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </ScreenMain>

      {/* Detail Panel */}
      {selectedItem && (
        <ItemDetailPanel
          item={items.find((i) => i.id === selectedItem.id) || selectedItem}
          onInstall={() =>
            setReviewItem(items.find((i) => i.id === selectedItem.id) || selectedItem)
          }
          onUninstall={() =>
            handleUninstall(items.find((i) => i.id === selectedItem.id) || selectedItem)
          }
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Install Review Modal */}
      {reviewItem && (
        <InstallReviewSheet
          item={reviewItem}
          onClose={() => setReviewItem(null)}
          onConfirm={() => handleInstall(reviewItem)}
        />
      )}
    </ScreenSidebarLayout>
  );
}
