export type MarketplaceCategory = "All" | "Extensions" | "Agent Templates" | "Tool Packs" | "Memory Packs" | "Themes";

export interface MarketplaceItem {
  id: string;
  name: string;
  author: string;
  installs: string;
  installCount: number;
  desc: string;
  category: MarketplaceCategory;
  installed: boolean;
  featured?: boolean;
  trusted: boolean;
  version: string;
  permissions: string[];
  signed: boolean;
  compatibility: string;
  lastUpdated: string;
  rating: number;
  tags: string[];
}

export type SortOption = "popular" | "recent" | "name" | "rating";
export type TrustFilter = "all" | "trusted" | "unverified";
export type AuthorFilter = "all" | "official" | "community";
