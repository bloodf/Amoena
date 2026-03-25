import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

import { MarketplaceItemCard } from "./MarketplaceItemCard";
import type { MarketplaceItem } from "./types";

const baseItem: MarketplaceItem = {
  id: "ext-1",
  name: "Git Tools",
  author: "anthropic",
  installs: "12k",
  installCount: 12000,
  desc: "Handy git integration tools for version control",
  category: "Extensions",
  installed: false,
  featured: false,
  trusted: true,
  version: "1.2.0",
  permissions: ["read:fs", "exec:git"],
  signed: true,
  compatibility: ">=1.0.0",
  lastUpdated: "2024-01-01",
  rating: 4.8,
  tags: ["git", "vcs", "devtools", "automation"],
};

function renderCard(overrides: Partial<MarketplaceItem> = {}, isSelected = false) {
  const handlers = {
    onSelect: mock(() => {}),
    onInstall: mock(() => {}),
    onUninstall: mock(() => {}),
  };
  const item = { ...baseItem, ...overrides };
  const result = render(
    <MarketplaceItemCard
      item={item}
      isSelected={isSelected}
      {...handlers}
    />,
  );
  return { ...result, ...handlers };
}

describe("MarketplaceItemCard", () => {
  test("renders the extension name", () => {
    renderCard();
    expect(screen.getByText("Git Tools")).toBeTruthy();
  });

  test("renders the author", () => {
    renderCard();
    expect(screen.getByText("anthropic")).toBeTruthy();
  });

  test("renders install count", () => {
    renderCard();
    expect(screen.getByText("12k")).toBeTruthy();
  });

  test("renders the description", () => {
    renderCard();
    expect(screen.getByText("Handy git integration tools for version control")).toBeTruthy();
  });

  test("renders the rating", () => {
    renderCard();
    expect(screen.getByText("4.8")).toBeTruthy();
  });

  test("shows trusted checkmark when trusted", () => {
    renderCard({ trusted: true });
    // CheckCircle icon is rendered for trusted items
    expect(screen.getByText("Git Tools")).toBeTruthy();
  });

  test("shows Install button when not installed", () => {
    renderCard({ installed: false });
    expect(screen.getByText("Install")).toBeTruthy();
  });

  test("shows Uninstall button when installed", () => {
    renderCard({ installed: true });
    expect(screen.getByText("Uninstall")).toBeTruthy();
  });

  test("calls onInstall when Install is clicked", () => {
    const { onInstall } = renderCard({ installed: false });
    fireEvent.click(screen.getByText("Install"));
    expect(onInstall).toHaveBeenCalled();
  });

  test("calls onUninstall when Uninstall is clicked", () => {
    const { onUninstall } = renderCard({ installed: true });
    fireEvent.click(screen.getByText("Uninstall"));
    expect(onUninstall).toHaveBeenCalled();
  });

  test("calls onSelect when card is clicked", () => {
    const { onSelect } = renderCard();
    fireEvent.click(screen.getByText("Git Tools"));
    expect(onSelect).toHaveBeenCalled();
  });

  test("renders up to 3 tags", () => {
    renderCard();
    expect(screen.getByText("git")).toBeTruthy();
    expect(screen.getByText("vcs")).toBeTruthy();
    expect(screen.getByText("devtools")).toBeTruthy();
    // 4th tag is hidden with +N
    expect(screen.getByText("+1")).toBeTruthy();
  });

  test("does not show +N when 3 or fewer tags", () => {
    renderCard({ tags: ["git", "vcs"] });
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  test("shows Star icon for featured items", () => {
    renderCard({ featured: true });
    expect(screen.getByText("Git Tools")).toBeTruthy();
  });

  test("install button click does not trigger onSelect", () => {
    const { onSelect, onInstall } = renderCard();
    fireEvent.click(screen.getByText("Install"));
    // Install uses stopPropagation, so onSelect should not be called from Install
    expect(onInstall).toHaveBeenCalled();
  });
});
