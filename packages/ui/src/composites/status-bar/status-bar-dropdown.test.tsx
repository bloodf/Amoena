import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { StatusBarDropdown } from "./StatusBarDropdown";

describe("StatusBarDropdown", () => {
  test("renders nothing when closed", () => {
    const { container } = render(
      <StatusBarDropdown open={false} onClose={mock(() => {})}>
        <span>content</span>
      </StatusBarDropdown>,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders children when open", () => {
    render(
      <StatusBarDropdown open={true} onClose={mock(() => {})}>
        <span>visible content</span>
      </StatusBarDropdown>,
    );
    expect(screen.getByText("visible content")).toBeTruthy();
  });

  test("calls onClose when clicking outside", () => {
    const onClose = mock(() => {});
    render(
      <StatusBarDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </StatusBarDropdown>,
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  test("does not call onClose when clicking inside", () => {
    const onClose = mock(() => {});
    render(
      <StatusBarDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </StatusBarDropdown>,
    );
    fireEvent.mouseDown(screen.getByText("inside"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("applies custom className", () => {
    const { container } = render(
      <StatusBarDropdown open={true} onClose={mock(() => {})} className="custom-class">
        <span>test</span>
      </StatusBarDropdown>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom-class");
  });
});
