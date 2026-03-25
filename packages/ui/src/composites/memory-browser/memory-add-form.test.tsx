import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MemoryAddForm } from "./MemoryAddForm";
import type { MemoryType } from "./types";

function makeProps(overrides: Partial<Parameters<typeof MemoryAddForm>[0]> = {}) {
  return {
    keyValue: "",
    value: "",
    type: "manual" as MemoryType,
    onKeyChange: mock((_v: string) => {}),
    onValueChange: mock((_v: string) => {}),
    onTypeChange: mock((_v: MemoryType) => {}),
    onAdd: mock(() => {}),
    onCancel: mock(() => {}),
    ...overrides,
  };
}

describe("MemoryAddForm", () => {
  test("renders key input", () => {
    render(<MemoryAddForm {...makeProps()} />);
    expect(screen.getByPlaceholderText("memory.key")).toBeTruthy();
  });

  test("renders value textarea", () => {
    render(<MemoryAddForm {...makeProps()} />);
    expect(screen.getByPlaceholderText("Memory content...")).toBeTruthy();
  });

  test("renders Add button", () => {
    render(<MemoryAddForm {...makeProps()} />);
    expect(screen.getByText("Add")).toBeTruthy();
  });

  test("renders Cancel button", () => {
    render(<MemoryAddForm {...makeProps()} />);
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  test("Add button is disabled when key and value are empty", () => {
    render(<MemoryAddForm {...makeProps()} />);
    const addBtn = screen.getByText("Add").closest("button")!;
    expect(addBtn.disabled).toBe(true);
  });

  test("Add button is enabled when key and value are filled", () => {
    render(<MemoryAddForm {...makeProps({ keyValue: "my.key", value: "some value" })} />);
    const addBtn = screen.getByText("Add").closest("button")!;
    expect(addBtn.disabled).toBe(false);
  });

  test("calls onCancel when Cancel clicked", () => {
    const onCancel = mock(() => {});
    render(<MemoryAddForm {...makeProps({ onCancel })} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onKeyChange when key input changes", () => {
    const onKeyChange = mock((_v: string) => {});
    render(<MemoryAddForm {...makeProps({ onKeyChange })} />);
    fireEvent.change(screen.getByPlaceholderText("memory.key"), { target: { value: "new.key" } });
    expect(onKeyChange).toHaveBeenCalledWith("new.key");
  });
});
