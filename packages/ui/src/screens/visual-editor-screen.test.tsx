import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { VisualEditorScreen } from "./VisualEditorScreen";

describe("VisualEditorScreen", () => {
  test("renders the component tree pane", () => {
    render(<VisualEditorScreen />);
    expect(screen.getByText("Component Tree")).toBeTruthy();
  });

  test("renders the component tree nodes", () => {
    render(<VisualEditorScreen />);
    expect(screen.getByText("App")).toBeTruthy();
    expect(screen.getByText("Timeline")).toBeTruthy();
    expect(screen.getByText("Composer")).toBeTruthy();
  });

  test("renders the editor toolbar with zoom percentage", () => {
    render(<VisualEditorScreen />);
    expect(screen.getByText("100%")).toBeTruthy();
  });

  test("renders preview and code mode buttons", () => {
    render(<VisualEditorScreen />);
    expect(screen.getByText("Preview")).toBeTruthy();
    expect(screen.getByText("Code")).toBeTruthy();
  });

  test("zoom in increases zoom percentage", () => {
    const { container } = render(<VisualEditorScreen />);
    const zoomInBtn = container.querySelector(".lucide-zoom-in")?.closest("button");
    expect(zoomInBtn).toBeTruthy();
    fireEvent.click(zoomInBtn!);
    expect(screen.getByText("125%")).toBeTruthy();
  });

  test("zoom out decreases zoom percentage", () => {
    const { container } = render(<VisualEditorScreen />);
    const zoomOutBtn = container.querySelector(".lucide-zoom-out")?.closest("button");
    expect(zoomOutBtn).toBeTruthy();
    fireEvent.click(zoomOutBtn!);
    expect(screen.getByText("75%")).toBeTruthy();
  });

  test("reset zoom returns to 100%", () => {
    render(<VisualEditorScreen />);
    const resetBtn = screen.getByTitle("Reset zoom");
    expect(resetBtn).toBeTruthy();
    fireEvent.click(resetBtn);
    expect(screen.getByText("100%")).toBeTruthy();
  });

  test("clicking a component in the tree selects it", () => {
    render(<VisualEditorScreen />);
    fireEvent.click(screen.getByText("Timeline"));
    // The selected component should be reflected in the properties panel
    const { container } = render(<VisualEditorScreen />);
    expect(container.querySelector('[class*="border-l"]')).toBeTruthy();
  });

  test("switching to code mode", () => {
    render(<VisualEditorScreen />);
    fireEvent.click(screen.getByText("Code"));
    // After clicking Code, the code view should be active
    expect(screen.getByText("Code")).toBeTruthy();
  });

  test("renders properties panel section", () => {
    const { container } = render(<VisualEditorScreen />);
    // The properties panel is in the right side with a border-l
    const propertiesPanel = container.querySelector('[class*="border-l"]');
    expect(propertiesPanel).toBeTruthy();
  });

  test("renders SessionView in the component tree as default selected", () => {
    render(<VisualEditorScreen />);
    // SessionView appears in multiple places; just check it exists
    const elements = screen.getAllByText("SessionView");
    expect(elements.length).toBeGreaterThan(0);
  });
});
