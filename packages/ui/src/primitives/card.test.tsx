import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  test("renders structured content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent>Pending review</CardContent>
      </Card>,
    );

    expect(screen.getByText("Workspace")).not.toBeNull();
    expect(screen.getByText("Pending review")).not.toBeNull();
  });

  test("renders as a div element", () => {
    const { container } = render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  test("renders with all sub-components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer area</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).not.toBeNull();
    expect(screen.getByText("Description text")).not.toBeNull();
    expect(screen.getByText("Body content")).not.toBeNull();
    expect(screen.getByText("Footer area")).not.toBeNull();
  });

  test("renders empty card without errors", () => {
    const { container } = render(<Card />);
    expect(container.firstElementChild).not.toBeNull();
  });

  test("renders card with long content", () => {
    const longContent = "X".repeat(1000);
    render(
      <Card>
        <CardContent>{longContent}</CardContent>
      </Card>,
    );
    expect(screen.getByText(longContent)).not.toBeNull();
  });
});
