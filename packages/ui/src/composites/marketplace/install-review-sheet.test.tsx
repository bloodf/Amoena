import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { InstallReviewSheet } from "./InstallReviewSheet";
import type { MarketplaceItem } from "./types";

const baseItem: MarketplaceItem = {
  id: "item-1",
  name: "Git Tools",
  author: "anthropic",
  installs: "12k",
  installCount: 12000,
  desc: "Handy git integration tools",
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
  tags: ["git", "vcs"],
};

describe("InstallReviewSheet", () => {
  test("renders item name, author, and version", () => {
    render(
      <InstallReviewSheet
        item={baseItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("Git Tools")).toBeTruthy();
    expect(screen.getByText(/anthropic/)).toBeTruthy();
    expect(screen.getByText(/1\.2\.0/)).toBeTruthy();
  });

  test("shows Trusted status and CheckCircle icon when item.trusted is true", () => {
    render(
      <InstallReviewSheet
        item={baseItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("Trusted")).toBeTruthy();
  });

  test("shows Unverified status when item.trusted is false — branch line 27-28", () => {
    const untrustedItem: MarketplaceItem = { ...baseItem, trusted: false };
    render(
      <InstallReviewSheet
        item={untrustedItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("Unverified")).toBeTruthy();
  });

  test("shows Signed when item.signed is true — branch line 33", () => {
    render(
      <InstallReviewSheet
        item={baseItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("Signed")).toBeTruthy();
  });

  test("shows Unsigned and warning banner when item.signed is false — branch lines 33 & 51", () => {
    const unsignedItem: MarketplaceItem = { ...baseItem, signed: false };
    render(
      <InstallReviewSheet
        item={unsignedItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("Unsigned")).toBeTruthy();
    // The warning banner text about unsigned package
    expect(screen.getByText(/This package is unsigned/i)).toBeTruthy();
  });

  test("calls onClose when backdrop is clicked", () => {
    const onClose = mock(() => {});
    const { container } = render(
      <InstallReviewSheet item={baseItem} onClose={onClose} onConfirm={mock(() => {})} />,
    );
    // The outermost div is the backdrop
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });

  test("does not call onClose when inner dialog is clicked (stopPropagation)", () => {
    const onClose = mock(() => {});
    render(
      <InstallReviewSheet item={baseItem} onClose={onClose} onConfirm={mock(() => {})} />,
    );
    fireEvent.click(screen.getByText("Review Installation").closest("div")!.parentElement!);
    // Click on the dialog content itself should not close
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  test("calls onClose when Close button is clicked", () => {
    const onClose = mock(() => {});
    render(
      <InstallReviewSheet item={baseItem} onClose={onClose} onConfirm={mock(() => {})} />,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onClose when Cancel button is clicked", () => {
    const onClose = mock(() => {});
    render(
      <InstallReviewSheet item={baseItem} onClose={onClose} onConfirm={mock(() => {})} />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onConfirm when Install button is clicked", () => {
    const onConfirm = mock(() => {});
    render(
      <InstallReviewSheet item={baseItem} onClose={mock(() => {})} onConfirm={onConfirm} />,
    );
    fireEvent.click(screen.getByText("Install"));
    expect(onConfirm).toHaveBeenCalled();
  });

  test("renders all permissions", () => {
    render(
      <InstallReviewSheet
        item={baseItem}
        onClose={mock(() => {})}
        onConfirm={mock(() => {})}
      />,
    );
    expect(screen.getByText("read:fs")).toBeTruthy();
    expect(screen.getByText("exec:git")).toBeTruthy();
  });
});
