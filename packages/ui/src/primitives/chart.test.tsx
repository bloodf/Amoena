import { render } from "@testing-library/react";
import { describe, expect, it, test, vi } from "vitest";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  __ChartContext,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  resolveChartPayloadConfig,
  type ChartConfig,
} from "./chart";

describe("ChartContainer", () => {
  test("renders chart content wrapper", () => {
    const config: ChartConfig = {
      used: { label: "Used", color: "hsl(300 100% 36%)" },
    };

    render(
      <div style={{ width: 420, height: 240 }}>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={[{ name: "Anthropic", used: 142 }]}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" />
            <Bar dataKey="used" fill="var(--color-used)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>,
    );

    expect(document.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders theme-aware chart style variables", () => {
    const config: ChartConfig = {
      used: { label: "Used", color: "hsl(300 100% 36%)" },
    };

    render(
      <ChartStyle id="chart-test" config={config} />,
    );

    const styleTags = document.querySelectorAll("style");
    const chartStyle = Array.from(styleTags).find((s) =>
      s.textContent?.includes("[data-chart=chart-test]"),
    );
    expect(chartStyle).toBeTruthy();
    expect(chartStyle?.textContent).toContain('--color-used: hsl(300 100% 36%)');
  });

  test("resolves payload config from payload and nested payload objects", () => {
    const config: ChartConfig = {
      used: { label: "Used", color: "hsl(300 100% 36%)" },
      anthropic: { label: "Anthropic", color: "hsl(279 74% 51%)" },
    };

    expect(resolveChartPayloadConfig(config, { dataKey: "used" }, "used")?.label).toBe("Used");
    expect(
      resolveChartPayloadConfig(
        config,
        { payload: { provider: "anthropic" } },
        "provider",
      )?.label,
    ).toBe("Anthropic");
    expect(resolveChartPayloadConfig(config, null, "missing")).toBeUndefined();
  });

  test("renders tooltip and legend content inside the chart context", () => {
    const config: ChartConfig = {
      used: { label: "Used", color: "hsl(300 100% 36%)" },
    };

    const tooltip = render(
      <__ChartContext.Provider value={{ config }}>
        <ChartTooltipContent
          active
          payload={[{ dataKey: "used", name: "used", value: 142, color: "#ff00ff", payload: { used: 142 } } as any]}
        />
      </__ChartContext.Provider>,
    );

    expect(tooltip.getAllByText("Used").length).toBeGreaterThan(0);
    expect(tooltip.getByText("142")).toBeTruthy();

    const legend = render(
      <__ChartContext.Provider value={{ config }}>
        <ChartLegendContent payload={[{ value: "used", dataKey: "used", color: "#ff00ff" } as any]} />
      </__ChartContext.Provider>,
    );

    expect(legend.getAllByText("Used").length).toBeGreaterThan(0);
  });

  it("renders with auto-generated id when no id provided", () => {
    const config: ChartConfig = {};
    const { container } = render(
      <ChartContainer config={config}>
        <div />
      </ChartContainer>
    );
    const el = container.querySelector("[data-chart]");
    expect(el).toBeTruthy();
    expect(el!.getAttribute("data-chart")).toMatch(/^chart-/);
  });

  it("applies className prop", () => {
    const config: ChartConfig = {};
    const { container } = render(
      <ChartContainer config={config} className="custom-class">
        <div />
      </ChartContainer>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("ChartStyle branches", () => {
  it("returns null when config has no color or theme entries", () => {
    const { container } = render(
      <__ChartContext.Provider value={{ config: {} }}>
        <ChartStyle id="test" config={{ sales: { label: "Sales" } }} />
      </__ChartContext.Provider>
    );
    expect(container.querySelector("style")).toBeNull();
  });

  it("renders style tag when config has theme", () => {
    const config: ChartConfig = {
      revenue: { label: "Revenue", theme: { light: "#aabbcc", dark: "#112233" } },
    };
    const { container } = render(
      <__ChartContext.Provider value={{ config }}>
        <ChartStyle id="test" config={config} />
      </__ChartContext.Provider>
    );
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style!.innerHTML).toContain("--color-revenue");
  });

  it("renders style tag when config has empty string color (skips null)", () => {
    // color = "" is falsy so the color map returns null, but style tag still renders
    const config: ChartConfig = {
      revenue: { label: "Revenue", theme: { light: "#aabbcc", dark: "" } },
    };
    const { container } = render(
      <__ChartContext.Provider value={{ config }}>
        <ChartStyle id="test" config={config} />
      </__ChartContext.Provider>
    );
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
  });
});

describe("ChartTooltipContent branches", () => {
  const baseConfig: ChartConfig = {
    sales: { label: "Sales", color: "#ff0000" },
  };

  const makePayload = (overrides: Record<string, unknown> = {}) => ({
    dataKey: "sales",
    name: "sales",
    value: 100,
    color: "#ff0000",
    payload: { fill: "#ff0000" },
    ...overrides,
  });

  const wrap = (ui: React.ReactElement, config = baseConfig) => (
    <__ChartContext.Provider value={{ config }}>{ui}</__ChartContext.Provider>
  );

  it("returns null when active is false", () => {
    const { container } = render(
      wrap(<ChartTooltipContent active={false} payload={[makePayload() as any]} />)
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is empty array", () => {
    const { container } = render(
      wrap(<ChartTooltipContent active={true} payload={[]} />)
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is undefined", () => {
    const { container } = render(
      wrap(<ChartTooltipContent active={true} payload={undefined} />)
    );
    expect(container.firstChild).toBeNull();
  });

  it("hides label when hideLabel is true", () => {
    const { queryByText } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          label="Sales Label"
          hideLabel={true}
        />
      )
    );
    expect(queryByText("Sales Label")).toBeNull();
  });

  it("shows label from config when label matches config key", () => {
    const config: ChartConfig = { sales: { label: "Sales Label", color: "#ff0000" } };
    const { getAllByText } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          label="sales"
          hideLabel={false}
        />,
        config
      )
    );
    expect(getAllByText("Sales Label").length).toBeGreaterThan(0);
  });

  it("shows raw label string when not in config", () => {
    const { getByText } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          label="Custom Label"
          hideLabel={false}
        />
      )
    );
    expect(getByText("Custom Label")).toBeTruthy();
  });

  it("uses labelFormatter when provided", () => {
    const labelFormatter = vi.fn(() => <span>Formatted Label</span>);
    const { getByText } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          label="test"
          labelFormatter={labelFormatter}
        />
      )
    );
    expect(getByText("Formatted Label")).toBeTruthy();
  });

  it("hides indicator when hideIndicator is true", () => {
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          hideIndicator={true}
        />
      )
    );
    expect(container.querySelector(".rounded-\\[2px\\]")).toBeNull();
  });

  it("renders with line indicator", () => {
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          indicator="line"
        />
      )
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with dashed indicator", () => {
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          indicator="dashed"
        />
      )
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("nestLabel true when single payload and indicator is not dot", () => {
    // nestLabel = payload.length === 1 && indicator !== "dot"
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          indicator="line"
          label="sales"
        />,
        { sales: { label: "Sales", color: "#f00" } }
      )
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("nestLabel false with multiple payload items", () => {
    const config = { ...baseConfig, revenue: { label: "Revenue", color: "#0f0" } };
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[
            makePayload() as any,
            makePayload({ dataKey: "revenue", name: "revenue" }) as any,
          ]}
          indicator="dot"
        />,
        config
      )
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("uses custom formatter", () => {
    const formatter = vi.fn((_value: unknown, name: string) => <span>Custom: {name}</span>);
    const { getByText } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          formatter={formatter as any}
        />
      )
    );
    expect(getByText("Custom: sales")).toBeTruthy();
  });

  it("renders icon from itemConfig when icon exists", () => {
    const Icon = () => <svg data-testid="custom-icon" />;
    const configWithIcon: ChartConfig = { sales: { label: "Sales", icon: Icon } };
    const { getByTestId } = render(
      wrap(
        <ChartTooltipContent active={true} payload={[makePayload() as any]} />,
        configWithIcon
      )
    );
    expect(getByTestId("custom-icon")).toBeTruthy();
  });

  it("does not render value span when item.value is 0 (falsy)", () => {
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload({ value: 0 }) as any]}
        />
      )
    );
    expect(container.querySelector(".tabular-nums")).toBeNull();
  });

  it("uses color prop over payload color", () => {
    const { container } = render(
      wrap(
        <ChartTooltipContent
          active={true}
          payload={[makePayload() as any]}
          color="#abcdef"
        />
      )
    );
    const indicator = container.querySelector("[style*='--color-bg']");
    expect(indicator).toBeTruthy();
  });
});

describe("ChartLegendContent branches", () => {
  const baseConfig: ChartConfig = {
    sales: { label: "Sales", color: "#ff0000" },
  };

  const makePayload = (overrides: Record<string, unknown> = {}) => ({
    dataKey: "sales",
    value: "sales",
    color: "#ff0000",
    ...overrides,
  });

  const wrap = (ui: React.ReactElement, config = baseConfig) => (
    <__ChartContext.Provider value={{ config }}>{ui}</__ChartContext.Provider>
  );

  it("returns null when payload is empty", () => {
    const { container } = render(wrap(<ChartLegendContent payload={[]} />));
    expect(container.firstChild).toBeNull();
  });

  it("returns null when payload is undefined", () => {
    const { container } = render(wrap(<ChartLegendContent payload={undefined} />));
    expect(container.firstChild).toBeNull();
  });

  it("applies pt-3 when verticalAlign is bottom (default)", () => {
    const { container } = render(
      wrap(<ChartLegendContent payload={[makePayload() as any]} verticalAlign="bottom" />)
    );
    expect(container.firstChild).toHaveClass("pt-3");
  });

  it("applies pb-3 when verticalAlign is top", () => {
    const { container } = render(
      wrap(<ChartLegendContent payload={[makePayload() as any]} verticalAlign="top" />)
    );
    expect(container.firstChild).toHaveClass("pb-3");
  });

  it("renders icon when itemConfig has icon and hideIcon is false", () => {
    const Icon = () => <svg data-testid="legend-icon" />;
    const configWithIcon: ChartConfig = { sales: { label: "Sales", icon: Icon } };
    const { getByTestId } = render(
      wrap(
        <ChartLegendContent payload={[makePayload() as any]} hideIcon={false} />,
        configWithIcon
      )
    );
    expect(getByTestId("legend-icon")).toBeTruthy();
  });

  it("renders colored square when hideIcon is true (overrides icon)", () => {
    const Icon = () => <svg data-testid="legend-icon" />;
    const configWithIcon: ChartConfig = { sales: { label: "Sales", icon: Icon } };
    const { container, queryByTestId } = render(
      wrap(
        <ChartLegendContent payload={[makePayload() as any]} hideIcon={true} />,
        configWithIcon
      )
    );
    expect(container.querySelector(".h-2.w-2")).toBeTruthy();
    expect(queryByTestId("legend-icon")).toBeNull();
  });
});

describe("resolveChartPayloadConfig branches", () => {
  const config: ChartConfig = {
    sales: { label: "Sales", color: "#ff0000" },
    revenue: { label: "Revenue", color: "#00ff00" },
  };

  it("returns undefined for string payload", () => {
    expect(resolveChartPayloadConfig(config, "string", "sales")).toBeUndefined();
  });

  it("returns undefined for null payload", () => {
    expect(resolveChartPayloadConfig(config, null, "sales")).toBeUndefined();
  });

  it("returns undefined for number payload", () => {
    expect(resolveChartPayloadConfig(config, 42, "sales")).toBeUndefined();
  });

  it("resolves from direct payload string property", () => {
    const payload = { sales: "sales", payload: {} };
    expect(resolveChartPayloadConfig(config, payload, "sales")).toBe(config.sales);
  });

  it("resolves from nested payload.payload string property", () => {
    const payload = { dataKey: "x", payload: { sales: "sales" } };
    expect(resolveChartPayloadConfig(config, payload, "sales")).toBe(config.sales);
  });

  it("falls back to config[key] when payload has no string for that key", () => {
    const payload = { dataKey: "sales", payload: {} };
    expect(resolveChartPayloadConfig(config, payload, "sales")).toBe(config.sales);
  });

  it("returns undefined when key not found", () => {
    const payload = { dataKey: "x", payload: {} };
    expect(resolveChartPayloadConfig(config, payload, "unknown")).toBeUndefined();
  });

  it("handles payload.payload being null (payloadPayload undefined branch)", () => {
    const payload = { dataKey: "sales", payload: null };
    expect(resolveChartPayloadConfig(config, payload, "sales")).toBe(config.sales);
  });
});
