import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

describe("Collapsible", () => {
  test("renders trigger", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText("Toggle")).toBeDefined();
  });

  test("content is hidden by default", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Secret</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.queryByText("Secret")).toBeNull();
  });

  test("shows content when open", () => {
    render(
      <Collapsible open>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText("Visible")).toBeDefined();
  });

  test("toggles content on trigger click", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Toggled</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.queryByText("Toggled")).toBeNull();
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Toggled")).toBeDefined();
  });

  test("trigger has button role", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Click me</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  test("trigger has aria-expanded false when closed", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Expand</CollapsibleTrigger>
        <CollapsibleContent>Hidden</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "Expand" }).getAttribute("aria-expanded")).toBe("false");
  });

  test("trigger has aria-expanded true when open", () => {
    render(
      <Collapsible open>
        <CollapsibleTrigger>Collapse</CollapsibleTrigger>
        <CollapsibleContent>Visible</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "Collapse" }).getAttribute("aria-expanded")).toBe("true");
  });

  test("toggling updates aria-expanded", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("can collapse after expanding", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Toggle" });
    fireEvent.click(trigger);
    expect(screen.getByText("Content")).toBeDefined();
    fireEvent.click(trigger);
    expect(screen.queryByText("Content")).toBeNull();
  });

  test("supports disabled state on trigger", () => {
    render(
      <Collapsible disabled>
        <CollapsibleTrigger>Disabled</CollapsibleTrigger>
        <CollapsibleContent>Locked</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Disabled" });
    expect(trigger.getAttribute("data-disabled")).not.toBeNull();
  });
});
