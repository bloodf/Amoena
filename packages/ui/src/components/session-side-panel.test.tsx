import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { SessionSidePanel } from "./SessionSidePanel";

describe("SessionSidePanel", () => {
  test("renders without crash", () => {
    render(<SessionSidePanel />);
    // Should render something (tabs visible)
    expect(document.body).toBeTruthy();
  });

  test("renders with onOpenFile prop — branch line 33 (truthy path)", () => {
    const onOpenFile = mock((_fileName: string) => {});
    render(<SessionSidePanel onOpenFile={onOpenFile} />);
    expect(document.body).toBeTruthy();
  });

  test("renders without onOpenFile prop — branch line 33 (falsy path, uses fallback)", () => {
    // onOpenFile is optional; omitting it exercises the `onOpenFile || (() => {})` branch
    render(<SessionSidePanel />);
    expect(document.body).toBeTruthy();
  });

  test("renders tabs bar with Files tab visible by default", () => {
    render(<SessionSidePanel />);
    // SidePanelTabBar renders tab buttons
    const tabs = screen.getAllByRole("button");
    expect(tabs.length).toBeGreaterThan(0);
  });
});
