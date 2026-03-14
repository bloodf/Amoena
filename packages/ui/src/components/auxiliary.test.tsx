import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, mock, test } from "bun:test";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AgentsTab } from "@/composites/side-panel/AgentsTab";
import { CommandPalette } from "./CommandPalette";
import { EmptySessionState } from "./EmptySessionState";
import { MemoryTab } from "@/composites/side-panel/MemoryTab";
import { InstallReviewSheet } from "@/composites/marketplace/InstallReviewSheet";
import { ItemDetailPanel } from "@/composites/marketplace/ItemDetailPanel";
import { StatusBar } from "./StatusBar";
import type { MarketplaceItem } from "@/composites/marketplace/types";

const marketplaceItem: MarketplaceItem = {
  id: "git-pro",
  name: "Git Integration Pro",
  author: "lunaria-team",
  desc: "Advanced git workflow tools",
  version: "1.2.4",
  installs: "12.4k",
  installCount: 12400,
  rating: 4.8,
  category: "Extensions",
  tags: ["git", "workflow"],
  compatibility: ">=0.1.0",
  permissions: ["fs.read", "git"],
  trusted: true,
  signed: true,
  installed: false,
  featured: true,
  lastUpdated: "2d ago",
};

describe("Lunaria auxiliary surfaces", () => {
  test("renders empty session suggestions", () => {
    render(
      <EmptySessionState
        provider="claude"
        model="Claude 4 Sonnet"
        sessionName="New Session"
        onSuggestionClick={() => {}}
      />,
    );

    expect(screen.getByText("Get started")).not.toBeNull();
    expect(screen.getByText("Fix a bug")).not.toBeNull();
  });

  test("status bar expands rate limits", async () => {
    const user = userEvent.setup();
    render(<StatusBar />);

    const trigger = screen.getAllByRole("button").find((button) => button.textContent?.includes("86%"));
    expect(trigger).not.toBeNull();
    await user.click(trigger!);
    expect(screen.getByText("Rate Limits by Provider")).not.toBeNull();
    expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
  });

  test("install review sheet shows permissions", () => {
    render(
      <InstallReviewSheet item={marketplaceItem} onClose={() => {}} onConfirm={() => {}} />,
    );

    expect(screen.getByText("Review Installation")).not.toBeNull();
    expect(screen.getByText("fs.read")).not.toBeNull();
  });

  test("item detail panel renders metadata", () => {
    render(
      <ItemDetailPanel
        item={marketplaceItem}
        onInstall={() => {}}
        onUninstall={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Git Integration Pro" })).not.toBeNull();
    expect(screen.getAllByText("Trusted").length).toBeGreaterThan(0);
  });

  test("agents tab renders hierarchy and mailbox", () => {
    render(<AgentsTab />);
    expect(screen.getAllByText("Claude 4 Sonnet").length).toBeGreaterThan(0);
    expect(screen.getByText(/Subtask complete/i)).not.toBeNull();
  });

  test("memory tab renders entries and add action", () => {
    render(<MemoryTab />);
    expect(screen.getByPlaceholderText("Search memory...")).not.toBeNull();
    expect(screen.getByText("Add Memory")).not.toBeNull();
  });

  test("command palette shows grouped results and closes via action", async () => {
    const user = userEvent.setup();
    const onClose = mock(() => {});

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<CommandPalette open onClose={onClose} />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Commands").length).toBeGreaterThan(0);
    const settingsEntry = screen.getAllByText("Settings").find((node) => node.className.includes("text-[12.5px]"));
    expect(settingsEntry).not.toBeNull();
    await user.click(settingsEntry!);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(onClose).toHaveBeenCalled();
  });
});
