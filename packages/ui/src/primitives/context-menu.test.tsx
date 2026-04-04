import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenuSubTrigger", () => {
  test("renders without inset — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Sub Menu</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Child</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("renders with inset=true — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Sub Inset</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Child</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuSubTrigger.displayName).toBeTruthy();
  });
});

describe("ContextMenuSubContent", () => {
  test("displayName is set", () => {
    expect(ContextMenuSubContent.displayName).toBeTruthy();
  });
});

describe("ContextMenuContent", () => {
  test("displayName is set", () => {
    expect(ContextMenuContent.displayName).toBeTruthy();
  });
});

describe("ContextMenuItem", () => {
  test("renders without inset — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("renders with inset=true — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset>Inset Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuItem.displayName).toBeTruthy();
  });
});

describe("ContextMenuCheckboxItem", () => {
  test("renders with checked=true — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={true}>Checked</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("renders with checked=false — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={false}>Unchecked</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuCheckboxItem.displayName).toBeTruthy();
  });
});

describe("ContextMenuRadioItem", () => {
  test("renders inside RadioGroup — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="a">
            <ContextMenuRadioItem value="a">Option A</ContextMenuRadioItem>
            <ContextMenuRadioItem value="b">Option B</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuRadioItem.displayName).toBeTruthy();
  });
});

describe("ContextMenuLabel", () => {
  test("renders without inset — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Label</ContextMenuLabel>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("renders with inset=true — no crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel inset>Inset Label</ContextMenuLabel>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuLabel.displayName).toBeTruthy();
  });
});

describe("ContextMenuSeparator", () => {
  test("renders without crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>A</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>B</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });

  test("displayName is set", () => {
    expect(ContextMenuSeparator.displayName).toBeTruthy();
  });
});

describe("ContextMenuShortcut", () => {
  test("renders text content", () => {
    render(<ContextMenuShortcut>⌘K</ContextMenuShortcut>);
    expect(screen.getByText("⌘K")).toBeTruthy();
  });

  test("applies custom className alongside defaults", () => {
    render(<ContextMenuShortcut className="my-custom">⌘S</ContextMenuShortcut>);
    const el = screen.getByText("⌘S");
    expect(el.className).toContain("my-custom");
    expect(el.className).toContain("ml-auto");
    expect(el.className).toContain("tracking-widest");
    expect(el.className).toContain("text-muted-foreground");
  });

  test("no custom className — still has base classes", () => {
    render(<ContextMenuShortcut>⌘Z</ContextMenuShortcut>);
    const el = screen.getByText("⌘Z");
    expect(el.className).toContain("ml-auto");
    expect(el.className).toContain("tracking-widest");
  });

  test("displayName is ContextMenuShortcut", () => {
    expect(ContextMenuShortcut.displayName).toBe("ContextMenuShortcut");
  });
});

describe("ContextMenuGroup", () => {
  test("renders multiple items without crash", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Open</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem>G1</ContextMenuItem>
            <ContextMenuItem>G2</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
    expect(container).toBeTruthy();
  });
});
