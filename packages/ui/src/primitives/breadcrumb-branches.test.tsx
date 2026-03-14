import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./breadcrumb";

describe("Breadcrumb branch coverage", () => {
  test("BreadcrumbSeparator renders default ChevronRight when no children", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    // Default separator is ChevronRight SVG
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  test("BreadcrumbSeparator renders custom children when provided", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><span data-testid="custom-sep">/</span></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByTestId("custom-sep")).toBeTruthy();
  });

  test("BreadcrumbLink renders as child element when asChild is true", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><a href="/home">Home</a></BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    const link = screen.getByText("Home");
    expect(link.tagName).toBe("A");
  });

  test("BreadcrumbEllipsis renders with sr-only text", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByText("More")).toBeTruthy();
  });

  test("BreadcrumbPage has aria-current=page", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByText("Current").getAttribute("aria-current")).toBe("page");
  });
});
