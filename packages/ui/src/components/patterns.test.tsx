import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { SurfacePanel, SectionHeading, StatusPill, MetricCard, LabeledValueRow } from "./patterns";

describe("SectionHeading", () => {
  test("renders as h3 by default", () => {
    render(<SectionHeading>Label</SectionHeading>);
    const el = screen.getByText("Label");
    expect(el.tagName).toBe("H3");
  });

  test("renders as custom heading tag", () => {
    render(<SectionHeading as="h2">Custom</SectionHeading>);
    expect(screen.getByText("Custom").tagName).toBe("H2");
  });

  test("applies uppercase tracking styles", () => {
    render(<SectionHeading>Styled</SectionHeading>);
    expect(screen.getByText("Styled").className).toContain("uppercase");
  });
});

describe("SurfacePanel", () => {
  test("renders children", () => {
    render(<SurfacePanel>Panel content</SurfacePanel>);
    expect(screen.getByText("Panel content")).not.toBeNull();
  });

  test("applies border and bg classes", () => {
    render(<SurfacePanel>Styled</SurfacePanel>);
    const el = screen.getByText("Styled");
    expect(el.className).toContain("border-border");
    expect(el.className).toContain("bg-surface-1");
  });

  test("accepts custom padding", () => {
    render(<SurfacePanel padding="p-8">Padded</SurfacePanel>);
    expect(screen.getByText("Padded").className).toContain("p-8");
  });

  test("renders as custom element", () => {
    const { container } = render(<SurfacePanel as="section">Sec</SurfacePanel>);
    expect(container.querySelector("section")).not.toBeNull();
  });
});

describe("StatusPill", () => {
  test("renders label text", () => {
    render(<StatusPill label="Active" />);
    expect(screen.getByText("Active")).not.toBeNull();
  });

  test("applies muted tone by default", () => {
    render(<StatusPill label="Default" />);
    expect(screen.getByText("Default").className).toContain("bg-surface-3");
  });

  test("applies success tone", () => {
    render(<StatusPill label="OK" tone="success" />);
    expect(screen.getByText("OK").className).toContain("text-green");
  });

  test("applies danger tone", () => {
    render(<StatusPill label="Err" tone="danger" />);
    expect(screen.getByText("Err").className).toContain("text-destructive");
  });

  test("applies warning tone", () => {
    render(<StatusPill label="Warn" tone="warning" />);
    expect(screen.getByText("Warn").className).toContain("text-warning");
  });

  test("applies primary tone", () => {
    render(<StatusPill label="Info" tone="primary" />);
    expect(screen.getByText("Info").className).toContain("text-primary");
  });

  test("applies purple tone", () => {
    render(<StatusPill label="Purple" tone="purple" />);
    expect(screen.getByText("Purple").className).toContain("text-purple");
  });

  test("applies neutral tone", () => {
    render(<StatusPill label="Neutral" tone="neutral" />);
    expect(screen.getByText("Neutral").className).toContain("text-foreground");
  });
});

describe("MetricCard", () => {
  test("renders label and value", () => {
    render(<MetricCard label="Users" value="100" />);
    expect(screen.getByText("Users")).not.toBeNull();
    expect(screen.getByText("100")).not.toBeNull();
  });

  test("renders subtext when provided", () => {
    render(<MetricCard label="Sales" value="50" subtext="this week" />);
    expect(screen.getByText("this week")).not.toBeNull();
  });

  test("renders trend with up color", () => {
    render(<MetricCard label="Growth" value="20" trend="+5%" trendUp />);
    const trend = screen.getByText("+5%");
    expect(trend.className).toContain("text-green");
  });

  test("renders trend with down color", () => {
    render(<MetricCard label="Churn" value="3" trend="-2%" trendUp={false} />);
    const trend = screen.getByText("-2%");
    expect(trend.className).toContain("text-destructive");
  });

  test("renders trend with neutral color when trendUp undefined", () => {
    render(<MetricCard label="Flat" value="0" trend="0%" />);
    const trend = screen.getByText("0%");
    expect(trend.className).toContain("text-muted-foreground");
  });
});

describe("LabeledValueRow", () => {
  test("renders label and value", () => {
    render(<LabeledValueRow label="Status" value="Online" />);
    expect(screen.getByText("Status")).not.toBeNull();
    expect(screen.getByText("Online")).not.toBeNull();
  });

  test("applies flex layout", () => {
    const { container } = render(<LabeledValueRow label="Key" value="Val" />);
    const row = container.firstElementChild as HTMLElement;
    expect(row.className).toContain("flex");
    expect(row.className).toContain("justify-between");
  });
});

describe("SurfacePanel — edge cases", () => {
  test("renders with nested content", () => {
    render(
      <SurfacePanel>
        <SurfacePanel>Nested</SurfacePanel>
      </SurfacePanel>,
    );
    expect(screen.getByText("Nested")).not.toBeNull();
  });

  test("renders empty panel without errors", () => {
    const { container } = render(<SurfacePanel />);
    expect(container.firstElementChild).not.toBeNull();
  });
});

describe("StatusPill — edge cases", () => {
  test("renders with long label text", () => {
    render(<StatusPill label="Very Long Status Label" />);
    expect(screen.getByText("Very Long Status Label")).not.toBeNull();
  });

  test("renders with default tone when tone prop omitted", () => {
    render(<StatusPill label="Default Tone" />);
    expect(screen.getByText("Default Tone").className).toContain("bg-surface-3");
  });
});

describe("MetricCard — edge cases", () => {
  test("renders without subtext or trend", () => {
    render(<MetricCard label="Count" value="0" />);
    expect(screen.getByText("Count")).not.toBeNull();
    expect(screen.getByText("0")).not.toBeNull();
  });

  test("renders large values", () => {
    render(<MetricCard label="Revenue" value="$1,000,000" />);
    expect(screen.getByText("$1,000,000")).not.toBeNull();
  });
});
