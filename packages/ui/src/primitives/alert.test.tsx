import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  test("renders with default variant", () => {
    render(
      <Alert>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).not.toBeNull();
    expect(alert.className).toContain("bg-background");
    expect(screen.getByText("Info")).not.toBeNull();
    expect(screen.getByText("Something happened.")).not.toBeNull();
  });

  test("renders destructive variant", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Bad things happened.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-destructive");
  });

  test("renders title and description", () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description text</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Title").tagName).toBe("H5");
    expect(screen.getByText("Description text")).not.toBeNull();
  });

  test("has alert role for accessibility", () => {
    render(
      <Alert>
        <AlertDescription>Accessible</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeDefined();
  });

  test("applies custom className", () => {
    render(
      <Alert className="custom-alert">
        <AlertDescription>Custom</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert").className).toContain("custom-alert");
  });

  test("renders without title", () => {
    render(
      <Alert>
        <AlertDescription>No title</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("No title")).toBeDefined();
  });

  test("renders without description", () => {
    render(
      <Alert>
        <AlertTitle>Only title</AlertTitle>
      </Alert>,
    );
    expect(screen.getByText("Only title")).toBeDefined();
  });

  test("destructive variant has border styling", () => {
    render(
      <Alert variant="destructive">
        <AlertDescription>Destructive</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert").className).toContain("border-destructive");
  });

  test("title applies base classes", () => {
    render(
      <Alert>
        <AlertTitle>Styled Title</AlertTitle>
      </Alert>,
    );
    expect(screen.getByText("Styled Title").className).toContain("font-medium");
    expect(screen.getByText("Styled Title").className).toContain("leading-none");
  });

  test("description applies base classes", () => {
    render(
      <Alert>
        <AlertDescription>Styled Desc</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Styled Desc").className).toContain("text-sm");
  });

  test("default variant has rounded-lg and border", () => {
    render(
      <Alert>
        <AlertDescription>Borders</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("rounded-lg");
    expect(alert.className).toContain("border");
  });
});
