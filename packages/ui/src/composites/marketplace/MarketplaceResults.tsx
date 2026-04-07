import { Package } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import type { MarketplaceCategory, MarketplaceItem } from './types';

interface MarketplaceResultsProps {
  filtered: MarketplaceItem[];
  selectedItem: MarketplaceItem | null;
  activeCategory: MarketplaceCategory;
  searchQuery: string;
  showInstalled: boolean;
  hasActiveFilters: boolean;
  viewMode: 'grid' | 'list';
  onSelect: (item: MarketplaceItem) => void;
  onInstallRequest: (item: MarketplaceItem) => void;
  onUninstall: (item: MarketplaceItem) => void;
  onClearFilters: () => void;
}

export function MarketplaceResults({
  filtered,
  selectedItem,
  activeCategory,
  searchQuery,
  showInstalled,
  hasActiveFilters,
  viewMode,
  onSelect,
  onInstallRequest,
  onUninstall,
  onClearFilters,
}: MarketplaceResultsProps) {
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package size={36} className="text-muted-foreground mb-3" />
        <div className="text-[14px] text-foreground font-medium mb-1">No packages found</div>
        <div className="text-[12px] text-muted-foreground">
          {(() => {
            if (searchQuery) return `No results for "${searchQuery}"`;
            if (showInstalled) return 'No installed packages';
            return `No ${activeCategory.toLowerCase()} match your filters`;
          })()}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 text-[12px] text-primary cursor-pointer hover:text-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2')}>
      {filtered.map((item) => (
        <MarketplaceItemCard
          key={item.id}
          item={item}
          isSelected={selectedItem?.id === item.id}
          onSelect={() => onSelect(item)}
          onInstall={() => onInstallRequest(item)}
          onUninstall={() => onUninstall(item)}
        />
      ))}
    </div>
  );
}
