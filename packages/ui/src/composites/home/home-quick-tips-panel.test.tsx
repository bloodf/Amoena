import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HomeQuickTipsPanel } from "./HomeQuickTipsPanel";

const tips = [
  { shortcut: "⌘K", tip: "Open command palette" },
  { shortcut: "@", tip: "Reference files in chat" },
  { shortcut: "$", tip: "Use skills" },
];

describe("HomeQuickTipsPanel", () => {
  test("renders Quick Tips heading", () => {
    render(<HomeQuickTipsPanel tips={tips} />);
    expect(screen.getByText("Quick Tips")).toBeTruthy();
  });

  test("renders all shortcuts", () => {
    render(<HomeQuickTipsPanel tips={tips} />);
    expect(screen.getByText("⌘K")).toBeTruthy();
    expect(screen.getByText("@")).toBeTruthy();
    expect(screen.getByText("$")).toBeTruthy();
  });

  test("renders all tip descriptions", () => {
    render(<HomeQuickTipsPanel tips={tips} />);
    expect(screen.getByText("Open command palette")).toBeTruthy();
    expect(screen.getByText("Reference files in chat")).toBeTruthy();
    expect(screen.getByText("Use skills")).toBeTruthy();
  });

  test("renders empty list without error", () => {
    const { container } = render(<HomeQuickTipsPanel tips={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
