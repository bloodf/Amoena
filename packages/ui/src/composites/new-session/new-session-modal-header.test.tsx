import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { NewSessionModalHeader } from "./NewSessionModalHeader";

describe("NewSessionModalHeader", () => {
  test("renders New Session title", () => {
    render(<NewSessionModalHeader onClose={vi.fn(() => {})} />);
    expect(screen.getByText("New Session")).toBeTruthy();
  });

  test("renders close button", () => {
    render(<NewSessionModalHeader onClose={vi.fn(() => {})} />);
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  test("calls onClose when close button clicked", () => {
    const onClose = vi.fn(() => {});
    render(<NewSessionModalHeader onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
