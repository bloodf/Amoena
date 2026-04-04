import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  test("switches visible panel", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="review">Review panel</TabsContent>
        <TabsContent value="files">Files panel</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Review panel").getAttribute("data-state")).toBe("active");
    await user.click(screen.getByRole("tab", { name: "Files" }));
    expect(screen.getByText("Files panel").getAttribute("data-state")).toBe("active");
  });

  test("tab triggers have role=tab", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Tab A" })).not.toBeNull();
    expect(screen.getByRole("tab", { name: "Tab B" })).not.toBeNull();
  });

  test("tabs list has role=tablist", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist")).not.toBeNull();
  });

  test("panels have role=tabpanel", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).not.toBeNull();
  });

  test("active tab has aria-selected=true", () => {
    render(
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">First</TabsTrigger>
          <TabsTrigger value="second">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First panel</TabsContent>
        <TabsContent value="second">Second panel</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "First" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Second" }).getAttribute("aria-selected")).toBe("false");
  });

  test("tab has aria-controls pointing to its panel", () => {
    render(
      <Tabs defaultValue="x">
        <TabsList>
          <TabsTrigger value="x">X</TabsTrigger>
        </TabsList>
        <TabsContent value="x">Panel X</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab", { name: "X" });
    const panelId = tab.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("tabpanel");
  });

  test("arrow keys navigate between tabs", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel One</TabsContent>
        <TabsContent value="two">Panel Two</TabsContent>
        <TabsContent value="three">Panel Three</TabsContent>
      </Tabs>,
    );
    const tabOne = screen.getByRole("tab", { name: "One" });
    tabOne.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Two" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Three" }));
  });
});
