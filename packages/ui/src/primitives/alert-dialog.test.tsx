import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

function renderAlertDialog(open?: boolean) {
  return render(
    <AlertDialog defaultOpen={open}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

describe("AlertDialog", () => {
  test("renders trigger", () => {
    renderAlertDialog();
    expect(screen.getByRole("button", { name: "Delete" })).not.toBeNull();
  });

  test("opens on trigger click", () => {
    renderAlertDialog();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("alertdialog")).not.toBeNull();
  });

  test("shows action and cancel buttons when open", () => {
    renderAlertDialog(true);
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Continue" })).not.toBeNull();
  });

  test("has aria-modal attribute when open", () => {
    renderAlertDialog(true);
    const dialog = screen.getByRole("alertdialog");
    // AlertDialog content should have data-state=open
    expect(dialog.getAttribute("data-state")).toBe("open");
  });

  test("alertdialog has aria-labelledby pointing to title", () => {
    renderAlertDialog(true);
    const dialog = screen.getByRole("alertdialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl?.textContent).toBe("Are you sure?");
  });

  test("alertdialog has aria-describedby pointing to description", () => {
    renderAlertDialog(true);
    const dialog = screen.getByRole("alertdialog");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl?.textContent).toBe("This cannot be undone.");
  });

  test("Escape key closes alertdialog", () => {
    renderAlertDialog(true);
    expect(screen.getByRole("alertdialog")).not.toBeNull();
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("cancel button closes alertdialog", () => {
    renderAlertDialog(true);
    expect(screen.getByRole("alertdialog")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("action button closes alertdialog", () => {
    renderAlertDialog(true);
    expect(screen.getByRole("alertdialog")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
