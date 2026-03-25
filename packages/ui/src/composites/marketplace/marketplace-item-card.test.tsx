import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MarketplaceItemCard } from "./MarketplaceItemCard";
import type { MarketplaceItem } from "./types";

const item: MarketplaceItem = {
  id: "item-1",
  name: "Git Tools",
  author: "anthropic",
  installs: "12k",
  installCount: 12000,
  desc: "Git integration for Amoena",
  category: "Extensions",
  installed: false,
  trusted: true,
  version: "1.0.0",
  permissions: ["read:fs"],
  signed: true,
  compatibility: ">=1.0.0",
  lastUpdated: "2024-01-01",
  rating: 4.5,
  tags: ["git", "vcs", "integration", "tools"],
};

function makeProps(overrides: Partial<Parameters<typeof MarketplaceItemCard>[0]> = {}) {
  return {
    item,
    isSelected: false,
    onSelect: mock(() => {}),
    onInstall: mock(() => {}),
    onUninstall: mock(() => {}),
    ...overrides,
  };
}

describe("MarketplaceItemCard", () => {
  test("renders item name", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("Git Tools")).toBeTruthy();
  });

  test("renders author", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("anthropic")).toBeTruthy();
  });

  test("renders install count", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("12k")).toBeTruthy();
  });

  test("renders description", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("Git integration for Amoena")).toBeTruthy();
  });

  test("renders rating", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("4.5")).toBeTruthy();
  });

  test("renders Install button for uninstalled items", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("Install")).toBeTruthy();
  });

  test("renders Uninstall button for installed items", () => {
    render(<MarketplaceItemCard {...makeProps({ item: { ...item, installed: true } })} />);
    expect(screen.getByText("Uninstall")).toBeTruthy();
  });

  test("calls onSelect when card clicked", () => {
    const onSelect = mock(() => {});
    render(<MarketplaceItemCard {...makeProps({ onSelect })} />);
    fireEvent.click(screen.getByText("Git Tools"));
    expect(onSelect).toHaveBeenCalled();
  });

  test("renders first 3 tags and +N indicator", () => {
    render(<MarketplaceItemCard {...makeProps()} />);
    expect(screen.getByText("git")).toBeTruthy();
    expect(screen.getByText("vcs")).toBeTruthy();
    expect(screen.getByText("integration")).toBeTruthy();
    expect(screen.getByText("+1")).toBeTruthy();
  });

  test("applies selected styling when isSelected", () => {
    const { container } = render(<MarketplaceItemCard {...makeProps({ isSelected: true })} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-primary");
  });
});
