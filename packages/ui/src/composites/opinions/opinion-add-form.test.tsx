import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { OpinionAddForm } from "./OpinionAddForm";

function makeProps(overrides: Partial<Parameters<typeof OpinionAddForm>[0]> = {}) {
  return {
    title: "",
    description: "",
    value: "",
    onTitleChange: mock((_v: string) => {}),
    onDescriptionChange: mock((_v: string) => {}),
    onValueChange: mock((_v: string) => {}),
    onAdd: mock(() => {}),
    onCancel: mock(() => {}),
    ...overrides,
  };
}

describe("OpinionAddForm", () => {
  test("renders title input", () => {
    render(<OpinionAddForm {...makeProps()} />);
    expect(screen.getByPlaceholderText("Opinion title...")).toBeTruthy();
  });

  test("renders description input", () => {
    render(<OpinionAddForm {...makeProps()} />);
    expect(screen.getByPlaceholderText("Description (optional)...")).toBeTruthy();
  });

  test("renders value input", () => {
    render(<OpinionAddForm {...makeProps()} />);
    expect(screen.getByPlaceholderText("Value / preference...")).toBeTruthy();
  });

  test("Add button is disabled when title and value empty", () => {
    render(<OpinionAddForm {...makeProps()} />);
    const addBtn = screen.getByText("Add").closest("button")!;
    expect(addBtn.disabled).toBe(true);
  });

  test("Add button is enabled when title and value filled", () => {
    render(<OpinionAddForm {...makeProps({ title: "My Opinion", value: "true" })} />);
    const addBtn = screen.getByText("Add").closest("button")!;
    expect(addBtn.disabled).toBe(false);
  });

  test("calls onCancel when Cancel clicked", () => {
    const onCancel = mock(() => {});
    render(<OpinionAddForm {...makeProps({ onCancel })} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("calls onTitleChange when title typed", () => {
    const onTitleChange = mock((_v: string) => {});
    render(<OpinionAddForm {...makeProps({ onTitleChange })} />);
    fireEvent.change(screen.getByPlaceholderText("Opinion title..."), { target: { value: "New" } });
    expect(onTitleChange).toHaveBeenCalledWith("New");
  });
});
