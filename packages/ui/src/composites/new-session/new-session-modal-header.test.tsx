import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { NewSessionModalHeader } from "./NewSessionModalHeader";

describe("NewSessionModalHeader", () => {
  test("renders New Session title", () => {
    render(<NewSessionModalHeader onClose={mock(() => {})} />);
    expect(screen.getByText("New Session")).toBeTruthy();
  });

  test("renders close button", () => {
    render(<NewSessionModalHeader onClose={mock(() => {})} />);
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  test("calls onClose when close button clicked", () => {
    const onClose = mock(() => {});
    render(<NewSessionModalHeader onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
