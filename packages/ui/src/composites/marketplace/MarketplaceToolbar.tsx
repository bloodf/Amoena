import { Grid3X3, List, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives/select";
import type { AuthorFilter, SortOption, TrustFilter } from "./types";

export const sortLabels: Record<SortOption, string> = {
  popular: "Most Popular",
  recent: "Recently Updated",
  name: "Name A–Z",
  rating: "Highest Rated",
};

interface MarketplaceToolbarProps {
  searchQuery: string;
  showFilters: boolean;
  hasActiveFilters: boolean;
  sortBy: SortOption;
  trustFilter: TrustFilter;
  authorFilter: AuthorFilter;
  viewMode: "grid" | "list";
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onSortChange: (value: SortOption) => void;
  onTrustFilterChange: (value: TrustFilter) => void;
  onAuthorFilterChange: (value: AuthorFilter) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onClearFilters: () => void;
}

export function MarketplaceToolbar({
  searchQuery,
  showFilters,
  hasActiveFilters,
  sortBy,
  trustFilter,
  authorFilter,
  viewMode,
  onSearchChange,
  onToggleFilters,
  onSortChange,
  onTrustFilterChange,
  onAuthorFilterChange,
  onViewModeChange,
  onClearFilters,
}: MarketplaceToolbarProps) {
  return (
    <div className="p-4 border-b border-border flex-shrink-0 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search plugins, extensions, tools, themes..."
            className="h-10 rounded-lg border-border bg-surface-2 pl-9 pr-9 text-[13px]"
          />
          {searchQuery && (
            <Button
              onClick={() => onSearchChange("")}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </Button>
          )}
        </div>

        <Button
          onClick={onToggleFilters}
          variant="outline"
          size="sm"
          className={cn(
            "h-10 gap-1.5 rounded-lg text-[12px] transition-colors",
            showFilters || hasActiveFilters
              ? "border-primary/40 text-primary bg-primary/5"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
          )}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </Button>

        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5 border border-border">
          <Button
            onClick={() => onViewModeChange("grid")}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded transition-colors",
              viewMode === "grid" ? "bg-surface-1 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid3X3 size={14} />
          </Button>
          <Button
            onClick={() => onViewModeChange("list")}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded transition-colors",
              viewMode === "list" ? "bg-surface-1 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List size={14} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Sort:</span>
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger className="h-8 w-[160px] bg-surface-2 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortLabels).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Trust:</span>
            <Select value={trustFilter} onValueChange={(value) => onTrustFilterChange(value as TrustFilter)}>
              <SelectTrigger className="h-8 w-[130px] bg-surface-2 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="trusted">Trusted Only</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Author:</span>
            <Select value={authorFilter} onValueChange={(value) => onAuthorFilterChange(value as AuthorFilter)}>
              <SelectTrigger className="h-8 w-[140px] bg-surface-2 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                <SelectItem value="official">Official</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button onClick={onClearFilters} variant="link" size="sm" className="h-auto px-0 text-[11px]">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
