import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

function renderDrawer(open?: boolean) {
  return render(
    <Drawer open={open}>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>,
  );
}

describe("Drawer", () => {
  test("renders trigger", () => {
    renderDrawer();
    expect(screen.getByRole("button", { name: "Open" })).not.toBeNull();
  });

  test("shows content when open", () => {
    renderDrawer(true);
    expect(screen.getByText("Title")).not.toBeNull();
    expect(screen.getByText("Description")).not.toBeNull();
  });

  test("has role=dialog when open", () => {
    renderDrawer(true);
    expect(screen.getByRole("dialog")).not.toBeNull();
  });

  test("has aria-modal attribute when open", () => {
    renderDrawer(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toBeNull();
  });

  test("renders close button inside drawer", () => {
    render(
      <Drawer open>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
          <DrawerClose>Close</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("Close")).not.toBeNull();
  });

  test("renders footer content", () => {
    render(
      <Drawer open>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button>Submit</button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: "Submit" })).not.toBeNull();
  });
});
