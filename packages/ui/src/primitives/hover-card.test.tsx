import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
  test("renders trigger", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Hover me")).not.toBeNull();
  });

  test("shows content when defaultOpen", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("Card content")).not.toBeNull();
  });

  test("content is hidden when not open", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.queryByText("Card content")).toBeNull();
  });

  test("renders long content without overflow issues", () => {
    const longContent = "A".repeat(500);
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>{longContent}</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText(longContent)).not.toBeNull();
  });
});
