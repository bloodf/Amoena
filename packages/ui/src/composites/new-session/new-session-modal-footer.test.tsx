import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { NewSessionModalFooter } from "./NewSessionModalFooter";

describe("NewSessionModalFooter", () => {
  test("renders Cancel button", () => {
    render(<NewSessionModalFooter onClose={mock(() => {})} onCreate={mock(() => {})} />);
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  test("renders Create Session button", () => {
    render(<NewSessionModalFooter onClose={mock(() => {})} onCreate={mock(() => {})} />);
    expect(screen.getByText("Create Session")).toBeTruthy();
  });

  test("calls onClose when Cancel clicked", () => {
    const onClose = mock(() => {});
    render(<NewSessionModalFooter onClose={onClose} onCreate={mock(() => {})} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onCreate when Create Session clicked", () => {
    const onCreate = mock(() => {});
    render(<NewSessionModalFooter onClose={mock(() => {})} onCreate={onCreate} />);
    fireEvent.click(screen.getByText("Create Session"));
    expect(onCreate).toHaveBeenCalled();
  });
});
