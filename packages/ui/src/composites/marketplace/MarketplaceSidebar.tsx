import { cn } from '../../lib/utils.ts';
import { Button } from '../../primitives/button.tsx';
import { StatusPill } from '../../components/patterns.tsx';
import { ScreenNavButton, ScreenNavSection, ScreenSidebar } from '../../components/screen.tsx';
import type { AuthorFilter, MarketplaceCategory, MarketplaceItem, SortOption, TrustFilter } from "./types";

interface MarketplaceSidebarProps {
  categories: MarketplaceCategory[];
  items: MarketplaceItem[];
  activeCategory: MarketplaceCategory;
  showInstalled: boolean;
  authorFilter: AuthorFilter;
  trustFilter: TrustFilter;
  sortBy: SortOption;
  onCategoryChange: (category: MarketplaceCategory) => void;
  onInstalledSelect: () => void;
  onAuthorFilterToggle: () => void;
  onTrustFilterToggle: () => void;
  onTopRatedToggle: () => void;
}

export function MarketplaceSidebar({
  categories,
  items,
  activeCategory,
  showInstalled,
  authorFilter,
  trustFilter,
  sortBy,
  onCategoryChange,
  onInstalledSelect,
  onAuthorFilterToggle,
  onTrustFilterToggle,
  onTopRatedToggle,
}: MarketplaceSidebarProps) {
  const installedCount = items.filter((item) => item.installed).length;

  return (
    <ScreenSidebar className="w-[200px] p-3">
      <ScreenNavSection title="Browse">
        {categories.map((category) => {
          const count = category === "All" ? items.length : items.filter((item) => item.category === category).length;
          return (
            <ScreenNavButton key={category} active={activeCategory === category && !showInstalled} onClick={() => onCategoryChange(category)} className="justify-between">
              <span>{category}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{count}</span>
            </ScreenNavButton>
          );
        })}
      </ScreenNavSection>

      <div className="mx-3 border-t border-border" />

      <div className="p-3">
        <ScreenNavButton active={showInstalled} onClick={onInstalledSelect} className="justify-between">
          <span>Installed</span>
          <StatusPill label={installedCount} tone={installedCount > 0 ? "success" : "muted"} className="text-[10px]" />
        </ScreenNavButton>
      </div>

      <div className="mx-3 border-t border-border" />

      <ScreenNavSection title="Quick Filters" className="p-3">
        <Button
          onClick={onAuthorFilterToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start px-3 py-1.5 text-[12px]",
            authorFilter === "official" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Official Only
        </Button>
        <Button
          onClick={onTrustFilterToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start px-3 py-1.5 text-[12px]",
            trustFilter === "trusted" ? "bg-green/10 text-green" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Trusted Only
        </Button>
        <Button
          onClick={onTopRatedToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start px-3 py-1.5 text-[12px]",
            sortBy === "rating" ? "bg-warning/10 text-warning" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Top Rated
        </Button>
      </ScreenNavSection>
    </ScreenSidebar>
  );
}
