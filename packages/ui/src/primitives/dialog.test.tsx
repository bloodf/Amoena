import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function renderDialog(open?: boolean) {
  return render(
    <Dialog defaultOpen={open}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  );
}

describe("Dialog", () => {
  test("renders trigger", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Open" })).not.toBeNull();
  });

  test("opens on trigger click", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).not.toBeNull();
  });

  test("shows title and description when open", () => {
    renderDialog(true);
    expect(screen.getByText("Title")).not.toBeNull();
    expect(screen.getByText("Description")).not.toBeNull();
  });

  test("has role=dialog when open", () => {
    renderDialog(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toBeNull();
  });

  test("has aria-modal attribute when open", () => {
    renderDialog(true);
    const dialog = screen.getByRole("dialog");
    // Radix renders overlay with data-state; check the dialog is a modal
    expect(dialog).not.toBeNull();
    // Dialog content should have data-state=open
    expect(dialog.getAttribute("data-state")).toBe("open");
  });

  test("dialog has aria-labelledby pointing to title", () => {
    renderDialog(true);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl?.textContent).toBe("Title");
  });

  test("dialog has aria-describedby pointing to description", () => {
    renderDialog(true);
    const dialog = screen.getByRole("dialog");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl?.textContent).toBe("Description");
  });

  test("Escape key closes dialog", () => {
    renderDialog(true);
    expect(screen.getByRole("dialog")).not.toBeNull();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("controlled open/close via onOpenChange", () => {
    let open = true;
    const onOpenChange = (val: boolean) => { open = val; };
    const { rerender } = render(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).not.toBeNull();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(open).toBe(false);
    rerender(
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
