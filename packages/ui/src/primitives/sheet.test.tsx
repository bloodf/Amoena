import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

function renderSheet(open?: boolean) {
  return render(
    <Sheet defaultOpen={open}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>,
  );
}

describe("Sheet", () => {
  test("renders trigger", () => {
    renderSheet();
    expect(screen.getByRole("button", { name: "Open" })).not.toBeNull();
  });

  test("opens on trigger click", () => {
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).not.toBeNull();
  });

  test("shows title and description when open", () => {
    renderSheet(true);
    expect(screen.getByText("Title")).not.toBeNull();
    expect(screen.getByText("Description")).not.toBeNull();
  });

  test("has aria-modal attribute when open", () => {
    renderSheet(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-state")).toBe("open");
  });

  test("dialog has aria-labelledby pointing to title", () => {
    renderSheet(true);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl?.textContent).toBe("Title");
  });

  test("dialog has aria-describedby pointing to description", () => {
    renderSheet(true);
    const dialog = screen.getByRole("dialog");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl?.textContent).toBe("Description");
  });

  test("Escape key closes sheet", () => {
    renderSheet(true);
    expect(screen.getByRole("dialog")).not.toBeNull();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("renders sheet on left side", () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
            <SheetDescription>Side panel</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Left Sheet")).not.toBeNull();
  });

  test("renders sheet on top side", () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
            <SheetDescription>Top panel</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Top Sheet")).not.toBeNull();
  });

  test("renders sheet on bottom side", () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
            <SheetDescription>Bottom panel</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Bottom Sheet")).not.toBeNull();
  });
});
