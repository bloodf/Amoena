import { fireEvent, render } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { WorkspaceResizeHandle } from "./WorkspaceResizeHandle";

describe("WorkspaceResizeHandle", () => {
  test("renders horizontal handle with row-resize cursor", () => {
    const { container } = render(<WorkspaceResizeHandle orientation="horizontal" onResizeStart={mock(() => {})} />);
    const handle = container.firstChild as HTMLElement;
    expect(handle.className).toContain("cursor-row-resize");
  });

  test("renders vertical handle with col-resize cursor", () => {
    const { container } = render(<WorkspaceResizeHandle orientation="vertical" onResizeStart={mock(() => {})} />);
    const handle = container.firstChild as HTMLElement;
    expect(handle.className).toContain("cursor-col-resize");
  });

  test("calls onResizeStart on mousedown", () => {
    const onResizeStart = mock((_e: React.MouseEvent) => {});
    const { container } = render(<WorkspaceResizeHandle orientation="horizontal" onResizeStart={onResizeStart} />);
    fireEvent.mouseDown(container.firstChild as HTMLElement);
    expect(onResizeStart).toHaveBeenCalled();
  });

  test("horizontal handle has height class", () => {
    const { container } = render(<WorkspaceResizeHandle orientation="horizontal" onResizeStart={mock(() => {})} />);
    expect((container.firstChild as HTMLElement).className).toContain("h-[1px]");
  });

  test("vertical handle has width class", () => {
    const { container } = render(<WorkspaceResizeHandle orientation="vertical" onResizeStart={mock(() => {})} />);
    expect((container.firstChild as HTMLElement).className).toContain("w-[1px]");
  });
});
