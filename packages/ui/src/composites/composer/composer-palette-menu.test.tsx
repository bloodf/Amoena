import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { ComposerFilePicker, ComposerSkillsPicker } from "./ComposerPaletteMenu";
import { Terminal } from "lucide-react";

describe("ComposerFilePicker", () => {
  const files = [
    { path: "src/main.rs", name: "main.rs", type: "file" as const },
    { path: "src/auth", name: "auth", type: "folder" as const },
  ];

  test("renders file paths", () => {
    render(<ComposerFilePicker files={files} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("src/main.rs")).toBeTruthy();
    expect(screen.getByText("src/auth")).toBeTruthy();
  });

  test("renders type labels", () => {
    render(<ComposerFilePicker files={files} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("file")).toBeTruthy();
    expect(screen.getByText("folder")).toBeTruthy();
  });

  test("calls onSelect when file clicked", () => {
    const onSelect = vi.fn((_f: any) => {});
    render(<ComposerFilePicker files={files} selectedIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("src/main.rs"));
    expect(onSelect).toHaveBeenCalledWith(files[0]);
  });

  test("highlights selected index", () => {
    render(<ComposerFilePicker files={files} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    const firstBtn = screen.getByText("src/main.rs").closest("button")!;
    expect(firstBtn.className).toContain("bg-primary/10");
  });
});

describe("ComposerSkillsPicker", () => {
  const skills = [
    { name: "autopilot", desc: "Autonomous execution", Icon: Terminal },
    { name: "tdd", desc: "Test-driven development", Icon: Terminal },
  ];

  test("renders skill names", () => {
    render(<ComposerSkillsPicker skills={skills} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("autopilot")).toBeTruthy();
    expect(screen.getByText("tdd")).toBeTruthy();
  });

  test("renders skill descriptions", () => {
    render(<ComposerSkillsPicker skills={skills} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Autonomous execution")).toBeTruthy();
    expect(screen.getByText("Test-driven development")).toBeTruthy();
  });

  test("calls onSelect when skill clicked", () => {
    const onSelect = vi.fn((_s: any) => {});
    render(<ComposerSkillsPicker skills={skills} selectedIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("autopilot"));
    expect(onSelect).toHaveBeenCalledWith(skills[0]);
  });

  test("renders Skills heading", () => {
    render(<ComposerSkillsPicker skills={skills} selectedIndex={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Skills")).toBeTruthy();
  });
});
