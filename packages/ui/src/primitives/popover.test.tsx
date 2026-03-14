import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function renderPopover(open?: boolean) {
  return render(
    <Popover defaultOpen={open}>
      <PopoverTrigger>Toggle</PopoverTrigger>
      <PopoverContent>Popover content</PopoverContent>
    </Popover>,
  );
}

describe("Popover", () => {
  test("renders trigger", () => {
    renderPopover();
    expect(screen.getByRole("button", { name: "Toggle" })).not.toBeNull();
  });

  test("opens on trigger click", () => {
    renderPopover();
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByText("Popover content")).not.toBeNull();
  });

  test("shows content when defaultOpen", () => {
    renderPopover(true);
    expect(screen.getByText("Popover content")).not.toBeNull();
  });

  test("Escape key closes popover", () => {
    renderPopover(true);
    expect(screen.getByText("Popover content")).not.toBeNull();
    const content = screen.getByText("Popover content");
    fireEvent.keyDown(content, { key: "Escape" });
    expect(screen.queryByText("Popover content")).toBeNull();
  });

  test("trigger has aria-expanded when popover is open", () => {
    renderPopover(true);
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("trigger has aria-haspopup attribute", () => {
    renderPopover();
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger.getAttribute("aria-haspopup")).toBeTruthy();
  });

  test("controlled popover with onOpenChange", () => {
    let open = false;
    const onOpenChange = (val: boolean) => { open = val; };
    render(
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger>Toggle</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(open).toBe(true);
  });
});
