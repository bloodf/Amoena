import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { MarketplaceScreen } from "@/screens/MarketplaceScreen";

function chooseMarketplaceSelect(index: number, optionLabel: string) {
  const trigger = screen.getAllByRole("combobox")[index];
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("option", { name: optionLabel }));
}

describe("MarketplaceScreen details", () => {
  test("searches listings and shows empty state when nothing matches", () => {
    render(<MarketplaceScreen />);

    const input = screen.getByPlaceholderText(/Search plugins, extensions, tools, themes/i);
    fireEvent.change(input, { target: { value: "nonexistent-package" } });
    expect(screen.getByText("No packages found")).toBeTruthy();
  });

  test("shows installed view and opens a detail panel", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getByRole("button", { name: /^Installed 2$/i }));
    expect(screen.getAllByText("Installed").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Git Integration Pro"));
    expect(screen.getAllByText("Git Integration Pro").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Permissions/i).length).toBeGreaterThan(0);
  });

  test("toggles quick filters and view mode", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Trusted Only/i }));
    expect(screen.getByRole("button", { name: /Filters/i })).toBeTruthy();

    const viewButtons = screen.getAllByRole("button").filter((button) => button.querySelector("svg"));
    fireEvent.click(viewButtons[viewButtons.length - 1]);
    expect(screen.getAllByRole("button", { name: /Install|Uninstall/i }).length).toBeGreaterThan(0);
  });

  test("opens install review and installs an item", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[0]);
    expect(screen.getByText("Review Installation")).toBeTruthy();
    expect(screen.getByText(/Permissions Requested/i)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[1]);

    expect(screen.getAllByRole("button", { name: /Uninstall/i }).length).toBeGreaterThan(0);
  });

  test("can clear filters after using filter drawer controls", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    chooseMarketplaceSelect(1, "Trusted Only");
    chooseMarketplaceSelect(0, "Highest Rated");
    fireEvent.click(screen.getByText("Clear all"));

    expect(screen.queryByText("Clear all")).toBeNull();
  });

  test("can filter by category, community author, unverified trust, and alternate sort modes", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getByRole("button", { name: /Themes/ }));
    expect(screen.getByText("Midnight Amethyst")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    chooseMarketplaceSelect(2, "Community");
    chooseMarketplaceSelect(1, "Unverified");
    chooseMarketplaceSelect(0, "Name A–Z");
    expect(screen.getByText("Midnight Amethyst")).toBeTruthy();
  });

  test("can visit all category sidebar entries and installed view", () => {
    render(<MarketplaceScreen />);

    const labels = ["Extensions", "Agent Templates", "Tool Packs", "Memory Packs", "Themes"];
    for (const label of labels) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }

    fireEvent.click(screen.getByRole("button", { name: /^Installed 2$/i }));
    expect(screen.getAllByText("Installed").length).toBeGreaterThan(0);
  });
});
