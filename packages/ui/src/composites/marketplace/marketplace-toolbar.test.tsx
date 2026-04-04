import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MarketplaceToolbar, sortLabels } from "./MarketplaceToolbar";
import type { AuthorFilter, SortOption, TrustFilter } from "./types";

function makeProps(overrides: Partial<Parameters<typeof MarketplaceToolbar>[0]> = {}) {
  return {
    searchQuery: "",
    showFilters: false,
    hasActiveFilters: false,
    sortBy: "popular" as SortOption,
    trustFilter: "all" as TrustFilter,
    authorFilter: "all" as AuthorFilter,
    viewMode: "grid" as "grid" | "list",
    onSearchChange: vi.fn(() => {}),
    onToggleFilters: vi.fn(() => {}),
    onSortChange: vi.fn(() => {}),
    onTrustFilterChange: vi.fn(() => {}),
    onAuthorFilterChange: vi.fn(() => {}),
    onViewModeChange: vi.fn(() => {}),
    onClearFilters: vi.fn(() => {}),
    ...overrides,
  };
}

describe("MarketplaceToolbar", () => {
  test("renders search input with placeholder", () => {
    render(<MarketplaceToolbar {...makeProps()} />);
    expect(screen.getByPlaceholderText(/search plugins/i)).toBeTruthy();
  });

  test("calls onSearchChange when typing in search input", () => {
    const onSearchChange = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ onSearchChange })} />);
    const input = screen.getByPlaceholderText(/search plugins/i);
    fireEvent.change(input, { target: { value: "git" } });
    expect(onSearchChange).toHaveBeenCalledWith("git");
  });

  test("does not show clear button when searchQuery is empty", () => {
    render(<MarketplaceToolbar {...makeProps({ searchQuery: "" })} />);
    // X button should not be present
    const buttons = screen.getAllByRole("button");
    // Only Filters, Grid, List buttons visible — no X button
    expect(buttons.length).toBe(3);
  });

  test("shows clear button when searchQuery is non-empty and clears on click", () => {
    const onSearchChange = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ searchQuery: "git", onSearchChange })} />);
    // X clear button should appear
    const buttons = screen.getAllByRole("button");
    // Filters + Grid + List + X = 4
    expect(buttons.length).toBe(4);
    // Click the X (last button in the search row = first after search input area)
    // find button with no text (icon-only)
    const clearButton = buttons.find((btn) => btn.closest(".relative"));
    fireEvent.click(clearButton!);
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  test("calls onToggleFilters when Filters button is clicked", () => {
    const onToggleFilters = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ onToggleFilters })} />);
    fireEvent.click(screen.getByText("Filters"));
    expect(onToggleFilters).toHaveBeenCalled();
  });

  test("filters button has active style when showFilters is true", () => {
    render(<MarketplaceToolbar {...makeProps({ showFilters: true })} />);
    const filterBtn = screen.getByText("Filters").closest("button");
    expect(filterBtn?.className).toContain("text-primary");
  });

  test("filters button has active style when hasActiveFilters is true", () => {
    render(<MarketplaceToolbar {...makeProps({ hasActiveFilters: true })} />);
    const filterBtn = screen.getByText("Filters").closest("button");
    expect(filterBtn?.className).toContain("text-primary");
  });

  test("shows indicator dot when hasActiveFilters is true", () => {
    const { container } = render(<MarketplaceToolbar {...makeProps({ hasActiveFilters: true })} />);
    // dot is a span with bg-primary class
    const dot = container.querySelector(".bg-primary");
    expect(dot).toBeTruthy();
  });

  test("calls onViewModeChange(grid) when grid button is clicked", () => {
    const onViewModeChange = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ onViewModeChange, viewMode: "list" })} />);
    const buttons = screen.getAllByRole("button");
    // Grid button is second-to-last
    fireEvent.click(buttons[buttons.length - 2]);
    expect(onViewModeChange).toHaveBeenCalledWith("grid");
  });

  test("calls onViewModeChange(list) when list button is clicked", () => {
    const onViewModeChange = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ onViewModeChange, viewMode: "grid" })} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onViewModeChange).toHaveBeenCalledWith("list");
  });

  test("grid button has active style when viewMode is grid", () => {
    const { container } = render(<MarketplaceToolbar {...makeProps({ viewMode: "grid" })} />);
    const viewButtons = container.querySelectorAll(".bg-surface-1");
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  test("list button has active style when viewMode is list", () => {
    const { container } = render(<MarketplaceToolbar {...makeProps({ viewMode: "list" })} />);
    const viewButtons = container.querySelectorAll(".bg-surface-1");
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  test("does not render filter panel when showFilters is false", () => {
    render(<MarketplaceToolbar {...makeProps({ showFilters: false })} />);
    expect(screen.queryByText("Sort:")).toBeNull();
    expect(screen.queryByText("Trust:")).toBeNull();
    expect(screen.queryByText("Author:")).toBeNull();
  });

  test("renders filter panel when showFilters is true", () => {
    render(<MarketplaceToolbar {...makeProps({ showFilters: true })} />);
    expect(screen.getByText("Sort:")).toBeTruthy();
    expect(screen.getByText("Trust:")).toBeTruthy();
    expect(screen.getByText("Author:")).toBeTruthy();
  });

  test("does not show Clear all button when showFilters=true but hasActiveFilters=false", () => {
    render(<MarketplaceToolbar {...makeProps({ showFilters: true, hasActiveFilters: false })} />);
    expect(screen.queryByText("Clear all")).toBeNull();
  });

  test("shows Clear all button when showFilters=true and hasActiveFilters=true", () => {
    render(<MarketplaceToolbar {...makeProps({ showFilters: true, hasActiveFilters: true })} />);
    expect(screen.getByText("Clear all")).toBeTruthy();
  });

  test("calls onClearFilters when Clear all is clicked", () => {
    const onClearFilters = vi.fn(() => {});
    render(<MarketplaceToolbar {...makeProps({ showFilters: true, hasActiveFilters: true, onClearFilters })} />);
    fireEvent.click(screen.getByText("Clear all"));
    expect(onClearFilters).toHaveBeenCalled();
  });

  test("sortLabels has all four sort options", () => {
    expect(sortLabels.popular).toBe("Most Popular");
    expect(sortLabels.recent).toBe("Recently Updated");
    expect(sortLabels.name).toBe("Name A–Z");
    expect(sortLabels.rating).toBe("Highest Rated");
  });
});
