import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

describe("Resizable", () => {
  test("renders panels", () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <span>Left</span>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <span>Right</span>
        </ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(screen.getByText("Left")).toBeTruthy();
    expect(screen.getByText("Right")).toBeTruthy();
  });

  test("renders resize handle", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(container.querySelector("[data-panel-resize-handle-id]")).not.toBeNull();
  });

  test("resize handle has separator role", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const handle = container.querySelector("[role='separator']");
    expect(handle).not.toBeNull();
  });

  test("panel group renders with correct direction", () => {
    const { container } = render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>Top</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const group = container.querySelector("[data-panel-group]");
    expect(group).not.toBeNull();
    expect(group?.getAttribute("data-panel-group-direction")).toBe("vertical");
  });

  test("renders three panels with two handles", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={33}>One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={33}>Two</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={34}>Three</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("Two")).toBeTruthy();
    expect(screen.getByText("Three")).toBeTruthy();
    const handles = container.querySelectorAll("[data-panel-resize-handle-id]");
    expect(handles.length).toBe(2);
  });

  // Branch coverage: withHandle conditional
  test("renders grip icon inside handle when withHandle is true", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    // GripVertical renders an svg inside the handle's inner div
    expect(container.querySelector("svg")).not.toBeNull();
  });

  test("does not render grip icon when withHandle is false", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle withHandle={false} />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  test("does not render grip icon when withHandle is omitted", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  test("applies custom className to ResizableHandle", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle className="my-handle" />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.querySelector(".my-handle")).not.toBeNull();
  });

  test("applies custom className to ResizablePanelGroup", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal" className="custom-group">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.querySelector(".custom-group")).not.toBeNull();
  });
});
