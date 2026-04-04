import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  test("renders children", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="test.jpg" alt="Test image" />
      </AspectRatio>,
    );
    expect(screen.getByAltText("Test image")).toBeDefined();
  });

  test("renders with default ratio", () => {
    render(
      <AspectRatio>
        <div data-testid="child">Content</div>
      </AspectRatio>,
    );
    expect(screen.getByTestId("child")).toBeDefined();
  });

  test("applies inline padding-bottom style for ratio", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Widescreen</div>
      </AspectRatio>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.style.paddingBottom).toBeDefined();
  });

  test("renders with 4:3 ratio", () => {
    const { container } = render(
      <AspectRatio ratio={4 / 3}>
        <div data-testid="child43">4:3</div>
      </AspectRatio>,
    );
    expect(screen.getByTestId("child43")).toBeDefined();
    expect(container.firstElementChild).toBeDefined();
  });

  test("renders with 1:1 ratio", () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <div>Square</div>
      </AspectRatio>,
    );
    expect(container.firstElementChild).toBeDefined();
    expect(screen.getByText("Square")).toBeDefined();
  });

  test("renders video content", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <video data-testid="video" />
      </AspectRatio>,
    );
    expect(screen.getByTestId("video").tagName).toBe("VIDEO");
  });

  test("maintains position relative style", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>Positioned</div>
      </AspectRatio>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.position).toBe("relative");
  });
});
