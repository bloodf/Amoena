import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { InstallReviewSheet } from "./InstallReviewSheet";
import { ItemDetailPanel } from "./ItemDetailPanel";
import { MarketplaceFeaturedSection } from "./MarketplaceFeaturedSection";
import { MarketplaceItemCard } from "./MarketplaceItemCard";
import { MarketplaceResults } from "./MarketplaceResults";
import { MarketplaceSectionHeader } from "./MarketplaceSectionHeader";
import { MarketplaceSidebar } from "./MarketplaceSidebar";
import { MarketplaceToolbar } from "./MarketplaceToolbar";
import { allItems, marketplaceCategories } from "./data";

const meta: Meta = {
  title: "Composites/Marketplace",
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

const featuredItems = allItems.filter((i) => i.featured);
const installedItem = allItems.find((i) => i.installed)!;
const uninstalledItem = allItems.find((i) => !i.installed && i.trusted)!;
const untrustedItem = allItems.find((i) => !i.trusted)!;
const extensionItems = allItems.filter((i) => i.category === "Extensions");

// ---------------------------------------------------------------------------
// InstallReviewSheet
// ---------------------------------------------------------------------------

export const InstallReviewSheetDefault: Story = {
  name: "InstallReviewSheet / Default",
  render: () => (
    <InstallReviewSheet
      item={uninstalledItem}
      onClose={fn()}
      onConfirm={fn()}
    />
  ),
};

export const InstallReviewSheetUntrusted: Story = {
  name: "InstallReviewSheet / Untrusted Item",
  render: () => (
    <InstallReviewSheet
      item={untrustedItem}
      onClose={fn()}
      onConfirm={fn()}
    />
  ),
};

export const InstallReviewSheetManyPermissions: Story = {
  name: "InstallReviewSheet / Many Permissions",
  render: () => (
    <InstallReviewSheet
      item={allItems.find((i) => i.id === "db-explorer")!}
      onClose={fn()}
      onConfirm={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// ItemDetailPanel
// ---------------------------------------------------------------------------

export const ItemDetailPanelInstalled: Story = {
  name: "ItemDetailPanel / Installed",
  render: () => (
    <ItemDetailPanel
      item={installedItem}
      onInstall={fn()}
      onUninstall={fn()}
      onClose={fn()}
    />
  ),
};

export const ItemDetailPanelNotInstalled: Story = {
  name: "ItemDetailPanel / Not Installed",
  render: () => (
    <ItemDetailPanel
      item={uninstalledItem}
      onInstall={fn()}
      onUninstall={fn()}
      onClose={fn()}
    />
  ),
};

export const ItemDetailPanelUntrusted: Story = {
  name: "ItemDetailPanel / Untrusted",
  render: () => (
    <ItemDetailPanel
      item={untrustedItem}
      onInstall={fn()}
      onUninstall={fn()}
      onClose={fn()}
    />
  ),
};

export const ItemDetailPanelHighRated: Story = {
  name: "ItemDetailPanel / High Rated",
  render: () => (
    <ItemDetailPanel
      item={allItems.find((i) => i.rating >= 4.8)!}
      onInstall={fn()}
      onUninstall={fn()}
      onClose={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// MarketplaceFeaturedSection
// ---------------------------------------------------------------------------

export const FeaturedSectionDefault: Story = {
  name: "FeaturedSection / Default",
  render: () => (
    <MarketplaceFeaturedSection
      items={featuredItems}
      onSelect={fn()}
      onInstallRequest={fn()}
    />
  ),
};

export const FeaturedSectionSingleItem: Story = {
  name: "FeaturedSection / Single Item",
  render: () => (
    <MarketplaceFeaturedSection
      items={featuredItems.slice(0, 1)}
      onSelect={fn()}
      onInstallRequest={fn()}
    />
  ),
};

export const FeaturedSectionEmpty: Story = {
  name: "FeaturedSection / Empty",
  render: () => (
    <MarketplaceFeaturedSection
      items={[]}
      onSelect={fn()}
      onInstallRequest={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// MarketplaceItemCard
// ---------------------------------------------------------------------------

export const ItemCardDefault: Story = {
  name: "ItemCard / Default",
  render: () => (
    <MarketplaceItemCard
      item={uninstalledItem}
      isSelected={false}
      onSelect={fn()}
      onInstall={fn()}
      onUninstall={fn()}
    />
  ),
};

export const ItemCardSelected: Story = {
  name: "ItemCard / Selected",
  render: () => (
    <MarketplaceItemCard
      item={uninstalledItem}
      isSelected={true}
      onSelect={fn()}
      onInstall={fn()}
      onUninstall={fn()}
    />
  ),
};

export const ItemCardInstalled: Story = {
  name: "ItemCard / Installed",
  render: () => (
    <MarketplaceItemCard
      item={installedItem}
      isSelected={false}
      onSelect={fn()}
      onInstall={fn()}
      onUninstall={fn()}
    />
  ),
};

export const ItemCardUntrusted: Story = {
  name: "ItemCard / Untrusted",
  render: () => (
    <MarketplaceItemCard
      item={untrustedItem}
      isSelected={false}
      onSelect={fn()}
      onInstall={fn()}
      onUninstall={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// MarketplaceResults
// ---------------------------------------------------------------------------

export const ResultsGridDefault: Story = {
  name: "Results / Grid Default",
  render: () => (
    <MarketplaceResults
      filtered={allItems}
      selectedItem={null}
      activeCategory="All"
      searchQuery=""
      showInstalled={false}
      hasActiveFilters={false}
      viewMode="grid"
      onSelect={fn()}
      onInstallRequest={fn()}
      onUninstall={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ResultsListView: Story = {
  name: "Results / List View",
  render: () => (
    <MarketplaceResults
      filtered={allItems}
      selectedItem={null}
      activeCategory="All"
      searchQuery=""
      showInstalled={false}
      hasActiveFilters={false}
      viewMode="list"
      onSelect={fn()}
      onInstallRequest={fn()}
      onUninstall={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ResultsWithSelection: Story = {
  name: "Results / With Selection",
  render: () => (
    <MarketplaceResults
      filtered={extensionItems}
      selectedItem={extensionItems[0]}
      activeCategory="Extensions"
      searchQuery=""
      showInstalled={false}
      hasActiveFilters={false}
      viewMode="grid"
      onSelect={fn()}
      onInstallRequest={fn()}
      onUninstall={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ResultsFilteredEmpty: Story = {
  name: "Results / Filtered Empty",
  render: () => (
    <MarketplaceResults
      filtered={[]}
      selectedItem={null}
      activeCategory="All"
      searchQuery="nonexistent-query"
      showInstalled={false}
      hasActiveFilters={true}
      viewMode="grid"
      onSelect={fn()}
      onInstallRequest={fn()}
      onUninstall={fn()}
      onClearFilters={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// MarketplaceSectionHeader
// ---------------------------------------------------------------------------

export const SectionHeaderDefault: Story = {
  name: "SectionHeader / Default",
  render: () => <MarketplaceSectionHeader title="Extensions" count={12} />,
};

export const SectionHeaderZeroCount: Story = {
  name: "SectionHeader / Zero Results",
  render: () => <MarketplaceSectionHeader title="Themes" count={0} />,
};

export const SectionHeaderLargeCount: Story = {
  name: "SectionHeader / Large Count",
  render: () => <MarketplaceSectionHeader title="All Items" count={248} />,
};

// ---------------------------------------------------------------------------
// MarketplaceSidebar
// ---------------------------------------------------------------------------

export const SidebarDefault: Story = {
  name: "Sidebar / Default",
  render: () => (
    <div style={{ width: 260 }}>
      <MarketplaceSidebar
        categories={marketplaceCategories}
        items={allItems}
        activeCategory="All"
        showInstalled={false}
        authorFilter="all"
        trustFilter="all"
        sortBy="popular"
        onCategoryChange={fn()}
        onInstalledSelect={fn()}
        onAuthorFilterToggle={fn()}
        onTrustFilterToggle={fn()}
        onTopRatedToggle={fn()}
      />
    </div>
  ),
};

export const SidebarWithFiltersActive: Story = {
  name: "Sidebar / Filters Active",
  render: () => (
    <div style={{ width: 260 }}>
      <MarketplaceSidebar
        categories={marketplaceCategories}
        items={allItems}
        activeCategory="Extensions"
        showInstalled={true}
        authorFilter="official"
        trustFilter="trusted"
        sortBy="rating"
        onCategoryChange={fn()}
        onInstalledSelect={fn()}
        onAuthorFilterToggle={fn()}
        onTrustFilterToggle={fn()}
        onTopRatedToggle={fn()}
      />
    </div>
  ),
};

export const SidebarCommunityFilter: Story = {
  name: "Sidebar / Community Filter",
  render: () => (
    <div style={{ width: 260 }}>
      <MarketplaceSidebar
        categories={marketplaceCategories}
        items={allItems}
        activeCategory="Agent Templates"
        showInstalled={false}
        authorFilter="community"
        trustFilter="all"
        sortBy="recent"
        onCategoryChange={fn()}
        onInstalledSelect={fn()}
        onAuthorFilterToggle={fn()}
        onTrustFilterToggle={fn()}
        onTopRatedToggle={fn()}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// MarketplaceToolbar
// ---------------------------------------------------------------------------

export const ToolbarDefault: Story = {
  name: "Toolbar / Default",
  render: () => (
    <MarketplaceToolbar
      searchQuery=""
      showFilters={false}
      hasActiveFilters={false}
      sortBy="popular"
      trustFilter="all"
      authorFilter="all"
      viewMode="grid"
      onSearchChange={fn()}
      onToggleFilters={fn()}
      onSortChange={fn()}
      onTrustFilterChange={fn()}
      onAuthorFilterChange={fn()}
      onViewModeChange={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ToolbarWithSearch: Story = {
  name: "Toolbar / With Search",
  render: () => (
    <MarketplaceToolbar
      searchQuery="docker"
      showFilters={false}
      hasActiveFilters={false}
      sortBy="popular"
      trustFilter="all"
      authorFilter="all"
      viewMode="grid"
      onSearchChange={fn()}
      onToggleFilters={fn()}
      onSortChange={fn()}
      onTrustFilterChange={fn()}
      onAuthorFilterChange={fn()}
      onViewModeChange={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ToolbarFiltersExpanded: Story = {
  name: "Toolbar / Filters Expanded",
  render: () => (
    <MarketplaceToolbar
      searchQuery=""
      showFilters={true}
      hasActiveFilters={true}
      sortBy="rating"
      trustFilter="trusted"
      authorFilter="official"
      viewMode="grid"
      onSearchChange={fn()}
      onToggleFilters={fn()}
      onSortChange={fn()}
      onTrustFilterChange={fn()}
      onAuthorFilterChange={fn()}
      onViewModeChange={fn()}
      onClearFilters={fn()}
    />
  ),
};

export const ToolbarListMode: Story = {
  name: "Toolbar / List Mode",
  render: () => (
    <MarketplaceToolbar
      searchQuery=""
      showFilters={false}
      hasActiveFilters={false}
      sortBy="name"
      trustFilter="all"
      authorFilter="all"
      viewMode="list"
      onSearchChange={fn()}
      onToggleFilters={fn()}
      onSortChange={fn()}
      onTrustFilterChange={fn()}
      onAuthorFilterChange={fn()}
      onViewModeChange={fn()}
      onClearFilters={fn()}
    />
  ),
};
