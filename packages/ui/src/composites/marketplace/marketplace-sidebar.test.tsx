import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MarketplaceSidebar } from "./MarketplaceSidebar";
import type { MarketplaceCategory, MarketplaceItem } from "./types";

const items: MarketplaceItem[] = [
  {
    id: "1", name: "Git Tools", author: "anthropic", installs: "12k", installCount: 12000,
    desc: "Git integration", category: "Extensions", installed: true, trusted: true,
    version: "1.0.0", permissions: [], signed: true, compatibility: ">=1.0.0",
    lastUpdated: "2024-01-01", rating: 4.5, tags: ["git"],
  },
  {
    id: "2", name: "Theme Pack", author: "community", installs: "5k", installCount: 5000,
    desc: "Extra themes", category: "Themes", installed: false, trusted: false,
    version: "0.1.0", permissions: [], signed: false, compatibility: ">=1.0.0",
    lastUpdated: "2024-02-01", rating: 3.0, tags: ["theme"],
  },
];

const categories: MarketplaceCategory[] = ["All", "Extensions", "Themes"];

function makeProps(overrides: Partial<Parameters<typeof MarketplaceSidebar>[0]> = {}) {
  return {
    categories,
    items,
    activeCategory: "All" as MarketplaceCategory,
    showInstalled: false,
    authorFilter: "all" as const,
    trustFilter: "all" as const,
    sortBy: "popular" as const,
    onCategoryChange: vi.fn((_c: MarketplaceCategory) => {}),
    onInstalledSelect: vi.fn(() => {}),
    onAuthorFilterToggle: vi.fn(() => {}),
    onTrustFilterToggle: vi.fn(() => {}),
    onTopRatedToggle: vi.fn(() => {}),
    ...overrides,
  };
}

describe("MarketplaceSidebar", () => {
  test("renders category buttons", () => {
    render(<MarketplaceSidebar {...makeProps()} />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Extensions")).toBeTruthy();
    expect(screen.getByText("Themes")).toBeTruthy();
  });

  test("renders Installed button", () => {
    render(<MarketplaceSidebar {...makeProps()} />);
    expect(screen.getByText("Installed")).toBeTruthy();
  });

  test("renders quick filter buttons", () => {
    render(<MarketplaceSidebar {...makeProps()} />);
    expect(screen.getByText("Official Only")).toBeTruthy();
    expect(screen.getByText("Trusted Only")).toBeTruthy();
    expect(screen.getByText("Top Rated")).toBeTruthy();
  });

  test("calls onCategoryChange when category clicked", () => {
    const onCategoryChange = vi.fn((_c: MarketplaceCategory) => {});
    render(<MarketplaceSidebar {...makeProps({ onCategoryChange })} />);
    fireEvent.click(screen.getByText("Extensions"));
    expect(onCategoryChange).toHaveBeenCalledWith("Extensions");
  });

  test("calls onInstalledSelect when Installed clicked", () => {
    const onInstalledSelect = vi.fn(() => {});
    render(<MarketplaceSidebar {...makeProps({ onInstalledSelect })} />);
    fireEvent.click(screen.getByText("Installed"));
    expect(onInstalledSelect).toHaveBeenCalled();
  });

  test("calls onAuthorFilterToggle when Official Only clicked", () => {
    const onAuthorFilterToggle = vi.fn(() => {});
    render(<MarketplaceSidebar {...makeProps({ onAuthorFilterToggle })} />);
    fireEvent.click(screen.getByText("Official Only"));
    expect(onAuthorFilterToggle).toHaveBeenCalled();
  });
});
