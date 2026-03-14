import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MarketplaceItem, MarketplaceCategory, SortOption, TrustFilter, AuthorFilter } from "@/composites/marketplace/types";
import { allItems as initialData, marketplaceCategories } from "@/composites/marketplace/data";
import { InstallReviewSheet } from "@/composites/marketplace/InstallReviewSheet";
import { ItemDetailPanel } from "@/composites/marketplace/ItemDetailPanel";
import { MarketplaceFeaturedSection } from "@/composites/marketplace/MarketplaceFeaturedSection";
import { MarketplaceResults } from "@/composites/marketplace/MarketplaceResults";
import { MarketplaceSectionHeader } from "@/composites/marketplace/MarketplaceSectionHeader";
import { MarketplaceSidebar } from "@/composites/marketplace/MarketplaceSidebar";
import { MarketplaceToolbar, sortLabels } from "@/composites/marketplace/MarketplaceToolbar";
import { useMarketplaceState } from "@/composites/marketplace/useMarketplaceState";
import { ScreenMain, ScreenSidebarLayout } from "@/components/screen";

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

  const sectionTitle = showInstalled ? "Installed" : searchQuery ? "Search Results" : activeCategory;

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
          setActiveCategory("All");
        }}
        onAuthorFilterToggle={() => setAuthorFilter(authorFilter === "official" ? "all" : "official")}
        onTrustFilterToggle={() => setTrustFilter(trustFilter === "trusted" ? "all" : "trusted")}
        onTopRatedToggle={() => setSortBy(sortBy === "rating" ? "popular" : "rating")}
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
            {!showInstalled && activeCategory === "All" && !searchQuery && featuredItems.length > 0 && (
              <MarketplaceFeaturedSection
                items={featuredItems}
                onSelect={(item) => setSelectedItem(items.find((entry) => entry.id === item.id) || item)}
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
          item={items.find(i => i.id === selectedItem.id) || selectedItem}
          onInstall={() => setReviewItem(items.find(i => i.id === selectedItem.id) || selectedItem)}
          onUninstall={() => handleUninstall(items.find(i => i.id === selectedItem.id) || selectedItem)}
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
