import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { useMarketplaceState } from "./useMarketplaceState";
import type { MarketplaceItem } from "./types";

function makeItem(overrides: Partial<MarketplaceItem> = {}): MarketplaceItem {
  return {
    id: "item-1",
    name: "Test Plugin",
    author: "amoena-team",
    installs: "1k",
    installCount: 1000,
    desc: "A test plugin",
    category: "Extensions",
    installed: false,
    featured: false,
    trusted: true,
    version: "1.0.0",
    permissions: [],
    signed: true,
    compatibility: "1.0",
    lastUpdated: "2024-01-01",
    rating: 4.5,
    tags: ["test", "plugin"],
    ...overrides,
  };
}

const items: MarketplaceItem[] = [
  makeItem({ id: "1", name: "Alpha", author: "amoena-team", category: "Extensions", trusted: true, installCount: 500, rating: 4.0, tags: ["alpha"], installed: false, featured: true }),
  makeItem({ id: "2", name: "Beta", author: "community", category: "Themes", trusted: false, installCount: 200, rating: 3.5, tags: ["beta"], installed: true }),
  makeItem({ id: "3", name: "Gamma", author: "amoena-team", category: "Agent Templates", trusted: true, installCount: 800, rating: 5.0, tags: ["gamma"], installed: false, featured: true }),
  makeItem({ id: "4", name: "Delta Tool", author: "community", category: "Tool Packs", trusted: false, installCount: 100, rating: 2.0, tags: ["delta"], installed: true }),
];

describe("useMarketplaceState", () => {
  test("initializes with all items and default state", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    expect(result.current.items.length).toBe(4);
    expect(result.current.activeCategory).toBe("All");
    expect(result.current.showInstalled).toBe(false);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortBy).toBe("popular");
    expect(result.current.trustFilter).toBe("all");
    expect(result.current.authorFilter).toBe("all");
    expect(result.current.viewMode).toBe("grid");
  });

  test("filtered returns all items when category is All", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    // sorted by popular (installCount desc): Gamma(800), Alpha(500), Beta(200), Delta(100)
    expect(result.current.filtered.length).toBe(4);
    expect(result.current.filtered[0].id).toBe("3");
  });

  test("filtered by category when activeCategory is set", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setActiveCategory("Themes"); });
    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].name).toBe("Beta");
  });

  test("showInstalled filter overrides category filter", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => {
      result.current.setActiveCategory("Extensions");
      result.current.setShowInstalled(true);
    });
    // showInstalled takes priority: returns Beta and Delta which are installed
    expect(result.current.filtered.every((item) => item.installed)).toBe(true);
    expect(result.current.filtered.length).toBe(2);
  });

  test("searches by name", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSearchQuery("alpha"); });
    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].id).toBe("1");
  });

  test("searches by desc", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSearchQuery("test plugin"); });
    expect(result.current.filtered.length).toBe(4);
  });

  test("searches by author", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSearchQuery("amoena-team"); });
    expect(result.current.filtered.length).toBe(2);
  });

  test("searches by tag", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSearchQuery("gamma"); });
    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].id).toBe("3");
  });

  test("trustFilter=trusted excludes untrusted items", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setTrustFilter("trusted"); });
    expect(result.current.filtered.every((item) => item.trusted)).toBe(true);
    expect(result.current.filtered.length).toBe(2);
  });

  test("trustFilter=unverified excludes trusted items", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setTrustFilter("unverified"); });
    expect(result.current.filtered.every((item) => !item.trusted)).toBe(true);
    expect(result.current.filtered.length).toBe(2);
  });

  test("authorFilter=official filters to amoena-team only", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setAuthorFilter("official"); });
    expect(result.current.filtered.every((item) => item.author === "amoena-team")).toBe(true);
    expect(result.current.filtered.length).toBe(2);
  });

  test("authorFilter=community filters to community only", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setAuthorFilter("community"); });
    expect(result.current.filtered.every((item) => item.author === "community")).toBe(true);
    expect(result.current.filtered.length).toBe(2);
  });

  test("sortBy=name sorts alphabetically", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSortBy("name"); });
    const names = result.current.filtered.map((item) => item.name);
    expect(names).toEqual([...names].sort());
  });

  test("sortBy=rating sorts by rating descending", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSortBy("rating"); });
    const ratings = result.current.filtered.map((item) => item.rating);
    expect(ratings[0]).toBeGreaterThanOrEqual(ratings[1]);
  });

  test("sortBy=recent returns stable sort (no reorder crash)", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSortBy("recent"); });
    expect(result.current.filtered.length).toBe(4);
  });

  test("hasActiveFilters is false with default state", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    expect(result.current.hasActiveFilters).toBe(false);
  });

  test("hasActiveFilters is true when searchQuery is set", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSearchQuery("alpha"); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  test("hasActiveFilters is true when trustFilter is not all", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setTrustFilter("trusted"); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  test("hasActiveFilters is true when authorFilter is not all", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setAuthorFilter("official"); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  test("clearFilters resets search, trust, author, and sort", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => {
      result.current.setSearchQuery("alpha");
      result.current.setTrustFilter("trusted");
      result.current.setAuthorFilter("official");
      result.current.setSortBy("rating");
    });
    act(() => { result.current.clearFilters(); });
    expect(result.current.searchQuery).toBe("");
    expect(result.current.trustFilter).toBe("all");
    expect(result.current.authorFilter).toBe("all");
    expect(result.current.sortBy).toBe("popular");
    expect(result.current.hasActiveFilters).toBe(false);
  });

  test("handleInstall marks item as installed and clears reviewItem", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setReviewItem(items[0]); });
    expect(result.current.reviewItem?.id).toBe("1");

    act(() => { result.current.handleInstall(items[0]); });
    expect(result.current.items.find((i) => i.id === "1")?.installed).toBe(true);
    expect(result.current.reviewItem).toBeNull();
  });

  test("handleInstall updates selectedItem if it matches", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSelectedItem(items[0]); });
    act(() => { result.current.handleInstall(items[0]); });
    expect(result.current.selectedItem?.installed).toBe(true);
  });

  test("handleInstall does not update selectedItem if different id", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSelectedItem(items[1]); });
    act(() => { result.current.handleInstall(items[0]); });
    expect(result.current.selectedItem?.id).toBe("2");
    expect(result.current.selectedItem?.installed).toBe(true); // items[1] was already installed
  });

  test("handleUninstall marks item as not installed", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.handleUninstall(items[1]); });
    expect(result.current.items.find((i) => i.id === "2")?.installed).toBe(false);
  });

  test("handleUninstall updates selectedItem if it matches", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    act(() => { result.current.setSelectedItem(items[1]); });
    act(() => { result.current.handleUninstall(items[1]); });
    expect(result.current.selectedItem?.installed).toBe(false);
  });

  test("featuredItems returns featured non-installed items", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    // Alpha (featured, not installed) and Gamma (featured, not installed)
    expect(result.current.featuredItems.length).toBe(2);
    expect(result.current.featuredItems.every((i) => i.featured && !i.installed)).toBe(true);
  });

  test("viewMode toggles between grid and list", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    expect(result.current.viewMode).toBe("grid");
    act(() => { result.current.setViewMode("list"); });
    expect(result.current.viewMode).toBe("list");
  });

  test("showFilters toggles", () => {
    const { result } = renderHook(() => useMarketplaceState(items));
    expect(result.current.showFilters).toBe(false);
    act(() => { result.current.setShowFilters(true); });
    expect(result.current.showFilters).toBe(true);
  });
});
