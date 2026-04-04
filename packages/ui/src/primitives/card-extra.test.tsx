import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card extras", () => {
  test("renders title, description, content, and footer helpers", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
          <CardDescription>Current model budget</CardDescription>
        </CardHeader>
        <CardContent>
          <span>24.8k / 128k</span>
        </CardContent>
        <CardFooter>
          <button>Reset</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Token Usage")).toBeTruthy();
    expect(screen.getByText("Current model budget")).toBeTruthy();
    expect(screen.getByText("24.8k / 128k")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
  });

  test("renders card without footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Minimal</CardTitle>
        </CardHeader>
        <CardContent>Just content</CardContent>
      </Card>,
    );
    expect(screen.getByText("Minimal")).toBeTruthy();
    expect(screen.getByText("Just content")).toBeTruthy();
  });

  test("renders card without description", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title Only</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("Title Only")).toBeTruthy();
  });

  test("renders multiple cards independently", () => {
    render(
      <>
        <Card>
          <CardHeader>
            <CardTitle>Card A</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Card B</CardTitle>
          </CardHeader>
        </Card>
      </>,
    );
    expect(screen.getByText("Card A")).toBeTruthy();
    expect(screen.getByText("Card B")).toBeTruthy();
  });
});
