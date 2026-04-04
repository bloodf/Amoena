import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { SettingsSidebar } from "./SettingsSidebar";

describe("SettingsSidebar", () => {
  test("renders Settings heading", () => {
    render(<SettingsSidebar activeSection="general" onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  test("renders all section labels", () => {
    render(<SettingsSidebar activeSection="general" onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("General")).toBeTruthy();
    expect(screen.getByText("Editor")).toBeTruthy();
    expect(screen.getByText("Terminal")).toBeTruthy();
    expect(screen.getByText("Privacy")).toBeTruthy();
    expect(screen.getByText("Advanced")).toBeTruthy();
  });

  test("highlights active section", () => {
    render(<SettingsSidebar activeSection="editor" onSelect={vi.fn(() => {})} />);
    const editorBtn = screen.getByText("Editor").closest("button")!;
    expect(editorBtn.className).toContain("bg-surface-2");
  });

  test("calls onSelect when section clicked", () => {
    const onSelect = vi.fn((_id: string) => {});
    render(<SettingsSidebar activeSection="general" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Privacy"));
    expect(onSelect).toHaveBeenCalledWith("privacy");
  });

  test("inactive sections have muted text", () => {
    render(<SettingsSidebar activeSection="general" onSelect={vi.fn(() => {})} />);
    const privacyBtn = screen.getByText("Privacy").closest("button")!;
    expect(privacyBtn.className).toContain("text-muted-foreground");
  });
});
