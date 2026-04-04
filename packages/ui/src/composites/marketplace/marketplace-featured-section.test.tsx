import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MarketplaceFeaturedSection } from "./MarketplaceFeaturedSection";
import type { MarketplaceItem } from "./types";

const item: MarketplaceItem = {
  id: "featured-1",
  name: "Super Linter",
  author: "anthropic",
  installs: "50k",
  installCount: 50000,
  desc: "All-in-one linting solution",
  category: "Tool Packs",
  installed: false,
  featured: true,
  trusted: true,
  version: "3.0.0",
  permissions: ["read:fs"],
  signed: true,
  compatibility: ">=1.0.0",
  lastUpdated: "2024-03-01",
  rating: 4.9,
  tags: ["lint", "quality", "all-in-one"],
};

const untrustedItem: MarketplaceItem = {
  ...item,
  id: "featured-2",
  name: "Untrusted Plugin",
  trusted: false,
};

describe("MarketplaceFeaturedSection", () => {
  test("returns null when items list is empty — branch line 11", () => {
    const { container } = render(
      <MarketplaceFeaturedSection
        items={[]}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders featured items when list is non-empty — branch line 11", () => {
    render(
      <MarketplaceFeaturedSection
        items={[item]}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("Super Linter")).toBeTruthy();
    expect(screen.getByText("Featured & Recommended")).toBeTruthy();
  });

  test("shows CheckCircle icon for trusted items — branch line 30", () => {
    const { container } = render(
      <MarketplaceFeaturedSection
        items={[item]}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    // trusted=true: CheckCircle svg should be present
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  test("does not show CheckCircle for untrusted items — branch line 30", () => {
    const { container: c1 } = render(
      <MarketplaceFeaturedSection
        items={[item]}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    const { container: c2 } = render(
      <MarketplaceFeaturedSection
        items={[untrustedItem]}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    // Trusted item has more SVGs (CheckCircle) than untrusted
    const trustedSvgCount = c1.querySelectorAll("svg").length;
    const untrustedSvgCount = c2.querySelectorAll("svg").length;
    expect(trustedSvgCount).toBeGreaterThan(untrustedSvgCount);
  });

  test("calls onSelect when item card is clicked", () => {
    const onSelect = vi.fn(() => {});
    render(
      <MarketplaceFeaturedSection
        items={[item]}
        onSelect={onSelect}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    fireEvent.click(screen.getByText("Super Linter").closest("div")!);
    expect(onSelect).toHaveBeenCalledWith(item);
  });

  test("calls onInstallRequest when Install button is clicked and stops propagation", () => {
    const onInstallRequest = vi.fn(() => {});
    const onSelect = vi.fn(() => {});
    render(
      <MarketplaceFeaturedSection
        items={[item]}
        onSelect={onSelect}
        onInstallRequest={onInstallRequest}
      />,
    );
    fireEvent.click(screen.getByText("Install"));
    expect(onInstallRequest).toHaveBeenCalledWith(item);
    // onSelect should NOT be called because stopPropagation
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("renders at most 4 items", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      ...item,
      id: `item-${i}`,
      name: `Item ${i}`,
    }));
    render(
      <MarketplaceFeaturedSection
        items={items}
        onSelect={vi.fn(() => {})}
        onInstallRequest={vi.fn(() => {})}
      />,
    );
    // Only first 4 should be rendered
    expect(screen.queryByText("Item 4")).toBeNull();
    expect(screen.queryByText("Item 5")).toBeNull();
    expect(screen.getByText("Item 0")).toBeTruthy();
    expect(screen.getByText("Item 3")).toBeTruthy();
  });
});
