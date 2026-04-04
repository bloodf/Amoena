import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";

import { MemoryTierCard, categoryConfig } from "./MemoryTierCard";

describe("MemoryTierCard", () => {
  test("expands through L0/L1/L2 content and collapses back", () => {
    render(
      <MemoryTierCard
        id="memory-1"
        title="Auth preference"
        type="preference"
        category="preference"
        timestamp="10:00"
        l0Summary="Use integration tests"
        l1Summary="Expanded note for current session"
        l2Content="Long-term persisted preference"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /expand/i }));
    expect(screen.getByText("Expanded note for current session")).toBeTruthy();

    fireEvent.click(screen.getByText("Full details"));
    expect(screen.getByText("Long-term persisted preference")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /collapse/i }));
    expect(screen.queryByText("Long-term persisted preference")).toBeNull();
  });

  test("renders duplicate actions and empty L1/L2 branches safely", () => {
    const onMerge = vi.fn(() => {});
    const onDismiss = vi.fn(() => {});
    render(
      <MemoryTierCard
        id="memory-2"
        title="Duplicate memory"
        type="pattern"
        category="pattern"
        timestamp="11:00"
        l0Summary="Duplicate summary"
        isDuplicate
        onMerge={onMerge}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByText("Merge"));
    fireEvent.click(screen.getByRole("button", { name: /dismiss duplicate/i }));

    expect(onMerge).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  // Branch line 48: expand() when tier=l0 but l1Summary is absent — should not change tier
  test("expand does nothing when l1Summary is absent — branch line 48", () => {
    render(
      <MemoryTierCard
        id="memory-3"
        title="No L1"
        type="profile"
        category="profile"
        timestamp="12:00"
        l0Summary="Summary only"
      />,
    );
    // Click expand button — l1Summary absent, so tier stays l0
    fireEvent.click(screen.getByRole("button", { name: /expand/i }));
    // Should NOT show any expanded content
    expect(screen.queryByText("Show more")).toBeNull();
  });

  // Branch line 49: expand() when tier=l1 but l2Content is absent — tier stays at l1
  test("expand from l1 does nothing when l2Content is absent — branch line 49", () => {
    render(
      <MemoryTierCard
        id="memory-4"
        title="L1 only"
        type="entity"
        category="entity"
        timestamp="12:00"
        l0Summary="Summary"
        l1Summary="L1 summary only, no L2"
      />,
    );
    // Expand to l1
    fireEvent.click(screen.getByRole("button", { name: /expand/i }));
    expect(screen.getByText("L1 summary only, no L2")).toBeTruthy();
    // Now click collapse (tier is l1), try to expand further — no l2Content
    // "Full details" button should not appear
    expect(screen.queryByText("Full details")).toBeNull();
    // Click collapse to return to l0
    fireEvent.click(screen.getByRole("button", { name: /collapse/i }));
    expect(screen.queryByText("L1 summary only, no L2")).toBeNull();
  });

  // Branch line 53: collapse() when tier=l2 → goes to l1
  test("collapse from l2 returns to l1 — branch line 53", () => {
    render(
      <MemoryTierCard
        id="memory-5"
        title="Full tier"
        type="skill"
        category="skill"
        timestamp="13:00"
        l0Summary="L0"
        l1Summary="L1 expanded"
        l2Content="L2 full content"
      />,
    );
    // Go to l1
    fireEvent.click(screen.getByRole("button", { name: /expand/i }));
    // Go to l2 via "Full details"
    fireEvent.click(screen.getByText("Full details"));
    expect(screen.getByText("L2 full content")).toBeTruthy();
    // Collapse from l2 → should go to l1 (not l0)
    fireEvent.click(screen.getByRole("button", { name: /collapse/i }));
    expect(screen.queryByText("L2 full content")).toBeNull();
    expect(screen.getByText("L1 expanded")).toBeTruthy();
  });

  // Branch: isDuplicate=true but onMerge=undefined — no Merge button
  test("does not render Merge button when onMerge is absent — branch line 85", () => {
    const onDismiss = vi.fn(() => {});
    render(
      <MemoryTierCard
        id="memory-6"
        title="No merge"
        type="tool_usage"
        category="tool_usage"
        timestamp="14:00"
        l0Summary="Summary"
        isDuplicate
        onDismiss={onDismiss}
      />,
    );
    expect(screen.queryByText("Merge")).toBeNull();
    expect(screen.getByRole("button", { name: /dismiss duplicate/i })).toBeTruthy();
  });

  // Branch: isDuplicate=true but onDismiss=undefined — no dismiss button
  test("does not render Dismiss button when onDismiss is absent — branch line 93", () => {
    const onMerge = vi.fn(() => {});
    render(
      <MemoryTierCard
        id="memory-7"
        title="No dismiss"
        type="preference"
        category="preference"
        timestamp="14:00"
        l0Summary="Summary"
        isDuplicate
        onMerge={onMerge}
      />,
    );
    expect(screen.getByText("Merge")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /dismiss duplicate/i })).toBeNull();
  });

  // Branch: isDuplicate=false — no duplicate banner
  test("does not render duplicate banner when isDuplicate is false — branch line 80", () => {
    render(
      <MemoryTierCard
        id="memory-8"
        title="Clean"
        type="entity"
        category="entity"
        timestamp="15:00"
        l0Summary="Clean summary"
      />,
    );
    expect(screen.queryByText("Duplicate detected")).toBeNull();
  });

  test("categoryConfig exports all categories", () => {
    expect(categoryConfig.profile.label).toBe("Profile");
    expect(categoryConfig.preference.label).toBe("Preference");
    expect(categoryConfig.entity.label).toBe("Entity");
    expect(categoryConfig.pattern.label).toBe("Pattern");
    expect(categoryConfig.tool_usage.label).toBe("Tool Usage");
    expect(categoryConfig.skill.label).toBe("Skill");
  });
});
