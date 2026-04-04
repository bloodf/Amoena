import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./command";

describe("Command", () => {
  test("renders input and items", () => {
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByPlaceholderText("Search…")).toBeTruthy();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Banana")).toBeTruthy();
  });

  test("renders group heading", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem>Run</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("Actions")).toBeTruthy();
  });

  test("renders empty state", () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("No results found.")).toBeTruthy();
  });

  test("input has role=combobox", () => {
    render(
      <Command>
        <CommandInput placeholder="Type..." />
        <CommandList>
          <CommandGroup>
            <CommandItem>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  test("list has role=listbox", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandGroup>
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const listbox = container.querySelector("[role='listbox']");
    expect(listbox).not.toBeNull();
  });

  test("items have role=option", () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Alpha</CommandItem>
            <CommandItem>Beta</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    const options = container.querySelectorAll("[role='option']");
    expect(options.length).toBe(2);
  });

  test("input filters items by value", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
            <CommandItem>Cherry</CommandItem>
          </CommandGroup>
          <CommandEmpty>Nothing found.</CommandEmpty>
        </CommandList>
      </Command>,
    );
    const input = screen.getByPlaceholderText("Search…");
    fireEvent.change(input, { target: { value: "ban" } });
    const visibleOptions = container.querySelectorAll("[role='option']:not([aria-hidden='true'])");
    const textContents = Array.from(visibleOptions).map((el) => el.textContent);
    expect(textContents.some((t) => t?.includes("Banana"))).toBe(true);
  });

  test("renders multiple groups", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Vegetables">
            <CommandItem>Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.getByText("Vegetables")).toBeTruthy();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Carrot")).toBeTruthy();
  });
});
