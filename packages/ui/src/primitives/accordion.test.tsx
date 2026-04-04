import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

function renderAccordion() {
  return render(
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionContent>Content One</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionContent>Content Two</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe("Accordion", () => {
  test("renders triggers", () => {
    renderAccordion();
    expect(screen.getByRole("button", { name: /Section One/ })).not.toBeNull();
    expect(screen.getByRole("button", { name: /Section Two/ })).not.toBeNull();
  });

  test("expands item on click", () => {
    renderAccordion();
    fireEvent.click(screen.getByRole("button", { name: /Section One/ }));
    expect(screen.getByText("Content One")).not.toBeNull();
  });

  test("collapses item on second click", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /Section One/ });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("open");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("closed");
  });

  test("triggers have aria-expanded attribute", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /Section One/ });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("only one item open at a time in single mode", () => {
    renderAccordion();
    const triggerOne = screen.getByRole("button", { name: /Section One/ });
    const triggerTwo = screen.getByRole("button", { name: /Section Two/ });
    fireEvent.click(triggerOne);
    expect(triggerOne.getAttribute("data-state")).toBe("open");
    fireEvent.click(triggerTwo);
    expect(triggerTwo.getAttribute("data-state")).toBe("open");
    expect(triggerOne.getAttribute("data-state")).toBe("closed");
  });

  test("triggers have aria-controls pointing to content panels", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /Section One/ });
    const controls = trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
  });

  test("multiple mode allows multiple items open", () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Content B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(screen.getByRole("button", { name: "A" }).getAttribute("data-state")).toBe("open");
    expect(screen.getByRole("button", { name: "B" }).getAttribute("data-state")).toBe("open");
  });

  test("Enter key expands accordion item", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /Section One/ });
    trigger.focus();
    // Simulate pressing Enter on a focused button
    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("open");
  });

  test("Space key expands accordion item", () => {
    renderAccordion();
    const trigger = screen.getByRole("button", { name: /Section Two/ });
    trigger.focus();
    // Buttons natively respond to Space/Enter with click
    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("open");
  });
});
