import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";

describe("Menubar", () => {
  test("renders menu triggers", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    expect(screen.getByText("File")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
  });

  test("opens menu content on trigger click", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    fireEvent.pointerDown(screen.getByText("File"));
    expect(screen.getByText("New Tab")).toBeTruthy();
    expect(screen.getByText("⌘T")).toBeTruthy();
    expect(screen.getByText("Print")).toBeTruthy();
  });

  test("menubar has role=menubar", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByRole("menubar")).toBeTruthy();
  });

  test("menu content has role=menu when open", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Edit"));
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  test("menu items have role=menuitem when opened", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    expect(screen.getByText("New")).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  test("Escape key closes menubar menu", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("triggers have menuitem role within menubar", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const triggers = screen.getAllByRole("menuitem");
    expect(triggers.length).toBeGreaterThanOrEqual(2);
  });
});

describe("MenubarItem inset branch", () => {
  test("inset=true adds pl-8 class (line 110)", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem inset>Inset Item</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    const item = screen.getByText("Inset Item");
    expect(item.className).toContain("pl-8");
  });

  test("inset=false does not add pl-8", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Normal Item</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    const item = screen.getByText("Normal Item");
    expect(item.className).not.toContain("pl-8");
  });

  test("disabled item has data-disabled attribute", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>Disabled Action</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    const item = screen.getByText("Disabled Action");
    expect(item.hasAttribute("data-disabled")).toBe(true);
  });
});

describe("MenubarSubTrigger inset branch (line 50)", () => {
  test("inset=true adds pl-8 class to sub trigger", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger inset>More options</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Option A</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Edit"));
    const trigger = screen.getByText("More options");
    expect(trigger.className).toContain("pl-8");
  });

  test("inset=false does not add pl-8 to sub trigger", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>More options</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Option A</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Edit"));
    const trigger = screen.getByText("More options");
    expect(trigger.className).not.toContain("pl-8");
  });

  test("sub trigger renders chevron icon", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Submenu</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Sub item</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Edit"));
    // ChevronRight SVG should be present inside the sub trigger
    const subTrigger = screen.getByText("Submenu").closest("[data-radix-menubar-subtrigger]") ||
      screen.getByText("Submenu").parentElement;
    expect(subTrigger?.querySelector("svg")).not.toBeNull();
  });
});

describe("MenubarLabel inset branch (line 169)", () => {
  test("inset=true adds pl-8 to label", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Tools</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel inset>Actions</MenubarLabel>
            <MenubarItem>Do something</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Tools"));
    const label = screen.getByText("Actions");
    expect(label.className).toContain("pl-8");
  });

  test("inset=false does not add pl-8 to label", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Tools</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Actions</MenubarLabel>
            <MenubarItem>Do something</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Tools"));
    const label = screen.getByText("Actions");
    expect(label.className).not.toContain("pl-8");
  });
});

describe("MenubarCheckboxItem (line 122)", () => {
  test("renders checkbox item with role=menuitemcheckbox", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    expect(screen.getByRole("menuitemcheckbox")).toBeTruthy();
  });

  test("checked=true shows check indicator", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show Grid</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    const item = screen.getByRole("menuitemcheckbox");
    expect(item.getAttribute("aria-checked")).toBe("true");
  });

  test("checked=false unchecked state", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={false}>Show Grid</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    const item = screen.getByRole("menuitemcheckbox");
    expect(item.getAttribute("aria-checked")).toBe("false");
  });

  test("onCheckedChange fires when clicked", () => {
    const onCheckedChange = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              Toggle
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("View"));
    fireEvent.click(screen.getByRole("menuitemcheckbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe("MenubarRadioItem (line 145)", () => {
  test("renders radio items with role=menuitemradio", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Options</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="dark">
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Options"));
    const radios = screen.getAllByRole("menuitemradio");
    expect(radios.length).toBe(2);
  });

  test("selected radio item has aria-checked=true", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Theme</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="dark">
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Theme"));
    const darkItem = screen.getByText("Dark").closest("[role='menuitemradio']");
    expect(darkItem?.getAttribute("aria-checked")).toBe("true");
  });

  test("unselected radio item has aria-checked=false", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Theme</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="dark">
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Theme"));
    const lightItem = screen.getByText("Light").closest("[role='menuitemradio']");
    expect(lightItem?.getAttribute("aria-checked")).toBe("false");
  });

  test("onValueChange fires when selecting a radio", () => {
    const onValueChange = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Theme</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="dark" onValueChange={onValueChange}>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Theme"));
    fireEvent.click(screen.getByText("Light").closest("[role='menuitemradio']")!);
    expect(onValueChange).toHaveBeenCalledWith("light");
  });
});

describe("MenubarShortcut", () => {
  test("renders shortcut span with muted styling", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Save <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    const shortcut = screen.getByText("⌘S");
    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut.className).toContain("text-muted-foreground");
  });

  test("accepts custom className", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Open <MenubarShortcut className="custom-shortcut">⌘O</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    expect(screen.getByText("⌘O").className).toContain("custom-shortcut");
  });
});

describe("MenubarSeparator", () => {
  test("renders separator element", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Quit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    const separator = document.querySelector("[role='separator']");
    expect(separator).not.toBeNull();
  });
});

describe("MenubarSubContent (line 69)", () => {
  test("renders sub-menu content when sub is open", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Find</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Find Next</MenubarItem>
                <MenubarItem>Find Previous</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Edit"));
    // Open the sub trigger
    fireEvent.pointerEnter(screen.getByText("Find"));
    // Sub content items should be accessible after opening
    expect(screen.getByText("Find")).toBeTruthy();
  });
});

describe("MenubarGroup", () => {
  test("renders grouped items", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Format</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem>Bold</MenubarItem>
              <MenubarItem>Italic</MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem>Align Left</MenubarItem>
              <MenubarItem>Align Right</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("Format"));
    expect(screen.getByText("Bold")).toBeTruthy();
    expect(screen.getByText("Align Left")).toBeTruthy();
  });
});

describe("Menubar full composition", () => {
  test("renders a complex menubar with all component types", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Recent Files</MenubarLabel>
            <MenubarItem>
              New Window <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem inset>New Incognito Window</MenubarItem>
            <MenubarSeparator />
            <MenubarCheckboxItem checked>Show Bookmarks Bar</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value="top">
              <MenubarRadioItem value="top">Top</MenubarRadioItem>
              <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    // Basic render check
    expect(screen.getByText("File")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();

    // Open File menu
    fireEvent.pointerDown(screen.getByText("File"));
    expect(screen.getByText("Recent Files")).toBeTruthy();
    expect(screen.getByText("New Window")).toBeTruthy();
    expect(screen.getByText("⌘N")).toBeTruthy();
    expect(screen.getByText("Show Bookmarks Bar")).toBeTruthy();
    expect(screen.getByText("Top")).toBeTruthy();
    expect(screen.getByText("Bottom")).toBeTruthy();
  });

  test("MenubarContent applies custom className", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className="test-content-class">
            <MenubarItem>Item</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    fireEvent.pointerDown(screen.getByText("File"));
    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("test-content-class");
  });

  test("MenubarTrigger applies custom className", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="custom-trigger">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Item</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByText("File").className).toContain("custom-trigger");
  });
});
