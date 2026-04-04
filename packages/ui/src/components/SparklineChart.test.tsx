import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SparklineChart } from "./SparklineChart";

describe("SparklineChart — empty data", () => {
  test("renders an SVG element when data is empty", () => {
    const { container } = render(<SparklineChart data={[]} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  test("renders no polyline when data is empty", () => {
    const { container } = render(<SparklineChart data={[]} />);
    expect(container.querySelector("polyline")).toBeNull();
  });

  test("uses default width and height when data is empty", () => {
    const { container } = render(<SparklineChart data={[]} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("80");
    expect(svg.getAttribute("height")).toBe("24");
  });
});

describe("SparklineChart — single point", () => {
  test("renders a polyline for a single data point", () => {
    const { container } = render(<SparklineChart data={[42]} />);
    expect(container.querySelector("polyline")).not.toBeNull();
  });

  test("polyline points attribute is non-empty for single point", () => {
    const { container } = render(<SparklineChart data={[42]} />);
    const polyline = container.querySelector("polyline")!;
    expect(polyline.getAttribute("points")).not.toBe("");
  });
});

describe("SparklineChart — SVG attributes", () => {
  test("renders correct viewBox with default dimensions", () => {
    const { container } = render(<SparklineChart data={[1, 2, 3]} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 80 24");
  });

  test("renders correct viewBox with custom dimensions", () => {
    const { container } = render(<SparklineChart data={[1, 2, 3]} width={120} height={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 120 40");
  });

  test("sets width and height attributes from props", () => {
    const { container } = render(<SparklineChart data={[1, 2]} width={60} height={20} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("60");
    expect(svg.getAttribute("height")).toBe("20");
  });

  test("sets aria-hidden on the svg element", () => {
    const { container } = render(<SparklineChart data={[1, 2, 3]} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  test("polyline uses provided color as stroke", () => {
    const { container } = render(<SparklineChart data={[1, 2, 3]} color="#ff0000" />);
    const polyline = container.querySelector("polyline")!;
    expect(polyline.getAttribute("stroke")).toBe("#ff0000");
  });
});
