import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

mock.module("@/primitives/chart", () => ({
  RechartsResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  ChartTooltip: () => <div data-testid="tooltip" />,
  ChartLegend: () => <div data-testid="legend" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
}));

import { UsageApiLogPanel } from "./UsageApiLogPanel";
import { UsageOverviewPanel } from "./UsageOverviewPanel";
import { UsagePlatformsPanel } from "./UsagePlatformsPanel";
import { UsageSessionsPanel } from "./UsageSessionsPanel";
import { UsageTabs } from "./UsageTabs";
import { UsageCostTooltip, UsageSeriesTooltip } from "./UsageTooltips";
import { UsageStackedTooltip } from "./tooltips";
import {
  usageApiRequestLog,
  usageDailyCost,
  usageDailyUsage,
  usagePlatformBreakdown,
  usageProviderQuotas,
  usageSessionBreakdown,
  usageTabs,
} from "./data";

describe("UsageTabs", () => {
  test("renders all tab labels", () => {
    const onChange = mock(() => {});
    render(<UsageTabs tabs={[...usageTabs]} activeTab="overview" onChange={onChange} />);
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("By Session")).toBeTruthy();
    expect(screen.getByText("API Request Log")).toBeTruthy();
    expect(screen.getByText("By Platform")).toBeTruthy();
  });

  test("calls onChange when a tab is clicked", () => {
    const onChange = mock(() => {});
    render(<UsageTabs tabs={[...usageTabs]} activeTab="overview" onChange={onChange} />);
    fireEvent.click(screen.getByText("By Session"));
    expect(onChange).toHaveBeenCalledWith("sessions");
  });

  test("highlights the active tab", () => {
    const onChange = mock(() => {});
    const { container } = render(<UsageTabs tabs={[...usageTabs]} activeTab="sessions" onChange={onChange} />);
    const activeButton = screen.getByText("By Session").closest("button");
    expect(activeButton?.className).toContain("border-primary");
  });

  test("inactive tabs have transparent border", () => {
    const onChange = mock(() => {});
    render(<UsageTabs tabs={[...usageTabs]} activeTab="overview" onChange={onChange} />);
    const inactiveButton = screen.getByText("By Platform").closest("button");
    expect(inactiveButton?.className).toContain("border-transparent");
  });
});

describe("UsageOverviewPanel", () => {
  const defaultProps = {
    totalTokens: 198200,
    totalCost: 39.07,
    totalRequests: 151,
    dailyUsage: usageDailyUsage,
    dailyCost: usageDailyCost,
    providerQuotas: usageProviderQuotas,
    customTooltip: <UsageSeriesTooltip />,
    costTooltip: <UsageCostTooltip />,
  };

  test("renders metric cards with formatted values", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("198.2k")).toBeTruthy();
    expect(screen.getByText("$39.07")).toBeTruthy();
    expect(screen.getByText("151")).toBeTruthy();
  });

  test("renders metric card labels", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("Total Tokens")).toBeTruthy();
    expect(screen.getByText("Total Spent")).toBeTruthy();
    expect(screen.getByText("API Requests")).toBeTruthy();
    expect(screen.getByText("Avg Latency")).toBeTruthy();
  });

  test("renders section headings", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("Token Consumption by Provider")).toBeTruthy();
    expect(screen.getByText("Daily Cost")).toBeTruthy();
    expect(screen.getByText("Rate Limits & Quotas")).toBeTruthy();
  });

  test("renders provider quota cards", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("Anthropic")).toBeTruthy();
    expect(screen.getByText("OpenAI")).toBeTruthy();
    expect(screen.getByText("Google")).toBeTruthy();
    expect(screen.getByText("Codex")).toBeTruthy();
  });

  test("renders quota usage info", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("142 / 1000 requests")).toBeTruthy();
    expect(screen.getByText("858 remaining")).toBeTruthy();
  });

  test("renders provider cost info", () => {
    render(<UsageOverviewPanel {...defaultProps} />);
    expect(screen.getByText("$14.82 spent")).toBeTruthy();
    expect(screen.getByText("$0.015/1k tokens")).toBeTruthy();
  });
});

describe("UsagePlatformsPanel", () => {
  const defaultProps = {
    platformBreakdown: usagePlatformBreakdown,
    providerQuotas: usageProviderQuotas,
  };

  test("renders platform breakdown legend", () => {
    render(<UsagePlatformsPanel {...defaultProps} />);
    expect(screen.getByText("Spending by Platform")).toBeTruthy();
    expect(screen.getByText("45.8%")).toBeTruthy();
    expect(screen.getByText("26.7%")).toBeTruthy();
    expect(screen.getByText("17.2%")).toBeTruthy();
    expect(screen.getByText("10.3%")).toBeTruthy();
  });

  test("renders provider quota detail cards", () => {
    render(<UsagePlatformsPanel {...defaultProps} />);
    expect(screen.getByText("$14.82")).toBeTruthy();
    expect(screen.getByText("$8.64")).toBeTruthy();
    expect(screen.getByText("$5.55")).toBeTruthy();
    expect(screen.getByText("$3.18")).toBeTruthy();
  });

  test("renders rate and reset info", () => {
    render(<UsagePlatformsPanel {...defaultProps} />);
    expect(screen.getByText("$0.015/1k")).toBeTruthy();
    expect(screen.getByText("47m")).toBeTruthy();
  });

  test("renders usage percentages", () => {
    render(<UsagePlatformsPanel {...defaultProps} />);
    // 142/1000 = 14%
    expect(screen.getByText("14%")).toBeTruthy();
    // 38/500 = 8%
    expect(screen.getByText("8%")).toBeTruthy();
  });
});

describe("UsageSessionsPanel", () => {
  const defaultProps = {
    sessions: usageSessionBreakdown,
    customTooltip: <UsageSeriesTooltip />,
  };

  test("renders session table headers", () => {
    render(<UsageSessionsPanel {...defaultProps} />);
    expect(screen.getByText("Session")).toBeTruthy();
    expect(screen.getByText("Tokens")).toBeTruthy();
    expect(screen.getByText("Cost")).toBeTruthy();
    expect(screen.getByText("Model")).toBeTruthy();
    expect(screen.getByText("Provider")).toBeTruthy();
    expect(screen.getByText("Reqs")).toBeTruthy();
  });

  test("renders session rows", () => {
    render(<UsageSessionsPanel {...defaultProps} />);
    expect(screen.getByText("JWT Auth Refactor")).toBeTruthy();
    expect(screen.getByText("Rate Limiter Design")).toBeTruthy();
    expect(screen.getByText("API Routes")).toBeTruthy();
  });

  test("formats token values as k", () => {
    render(<UsageSessionsPanel {...defaultProps} />);
    expect(screen.getByText("42.8k")).toBeTruthy();
    expect(screen.getByText("28.4k")).toBeTruthy();
  });

  test("formats cost with dollar sign", () => {
    render(<UsageSessionsPanel {...defaultProps} />);
    expect(screen.getByText("$6.42")).toBeTruthy();
    expect(screen.getByText("$4.26")).toBeTruthy();
  });

  test("renders section heading for chart", () => {
    render(<UsageSessionsPanel {...defaultProps} />);
    expect(screen.getByText("Tokens by Session")).toBeTruthy();
  });
});

describe("UsageApiLogPanel", () => {
  const onProviderFilterChange = mock(() => {});
  const onSessionFilterChange = mock(() => {});
  const sessionOptions = ["JWT Auth Refactor", "Rate Limiter Design", "API Routes"];

  const defaultProps = {
    providerFilter: "all",
    sessionFilter: "all",
    filteredLog: usageApiRequestLog,
    sessionOptions,
    onProviderFilterChange,
    onSessionFilterChange,
  };

  test("renders filter controls", () => {
    render(<UsageApiLogPanel {...defaultProps} />);
    expect(screen.getByText("Filter:")).toBeTruthy();
  });

  test("renders request count", () => {
    render(<UsageApiLogPanel {...defaultProps} />);
    expect(screen.getByText("8 requests")).toBeTruthy();
  });

  test("renders table headers", () => {
    render(<UsageApiLogPanel {...defaultProps} />);
    expect(screen.getByText("Time")).toBeTruthy();
    expect(screen.getByText("Input")).toBeTruthy();
    expect(screen.getByText("Output")).toBeTruthy();
    expect(screen.getByText("Latency")).toBeTruthy();
  });

  test("renders log entries", () => {
    render(<UsageApiLogPanel {...defaultProps} />);
    expect(screen.getByText("10:42 AM")).toBeTruthy();
    expect(screen.getByText("1.2s")).toBeTruthy();
  });

  test("calls onProviderFilterChange when provider select changes", () => {
    const handler = mock(() => {});
    render(<UsageApiLogPanel {...defaultProps} onProviderFilterChange={handler} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Anthropic" } });
    expect(handler).toHaveBeenCalledWith("Anthropic");
  });

  test("calls onSessionFilterChange when session select changes", () => {
    const handler = mock(() => {});
    render(<UsageApiLogPanel {...defaultProps} onSessionFilterChange={handler} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "API Routes" } });
    expect(handler).toHaveBeenCalledWith("API Routes");
  });

  test("renders session filter options", () => {
    const { container } = render(<UsageApiLogPanel {...defaultProps} />);
    const options = container.querySelectorAll("option");
    // 2 "all" defaults + 4 providers + 3 sessions = 9
    expect(options.length).toBe(9);
  });
});

describe("UsageSeriesTooltip", () => {
  test("renders nothing when not active", () => {
    const { container } = render(<UsageSeriesTooltip active={false} payload={[]} label="" />);
    expect(container.innerHTML).toBe("");
  });

  test("renders label and payload when active", () => {
    const payload = [{ dataKey: "claude", value: 12400, color: "#ff0000" }];
    render(<UsageSeriesTooltip active={true} payload={payload} label="Mar 1" />);
    expect(screen.getByText("Mar 1")).toBeTruthy();
    expect(screen.getByText("claude:")).toBeTruthy();
    expect(screen.getByText("12.4k")).toBeTruthy();
  });
});

describe("UsageCostTooltip (UsageTooltips)", () => {
  test("renders nothing when not active", () => {
    const { container } = render(<UsageCostTooltip active={false} payload={[]} label="" />);
    expect(container.innerHTML).toBe("");
  });

  test("renders formatted cost when active", () => {
    const payload = [{ value: 3.82 }];
    render(<UsageCostTooltip active={true} payload={payload} label="Mar 2" />);
    expect(screen.getByText("Mar 2")).toBeTruthy();
    expect(screen.getByText("$3.82")).toBeTruthy();
  });
});

describe("UsageStackedTooltip (tooltips.tsx)", () => {
  test("renders nothing when not active", () => {
    const { container } = render(<UsageStackedTooltip active={false} payload={[]} label="" />);
    expect(container.innerHTML).toBe("");
  });

  test("renders payload entries when active", () => {
    const payload = [
      { dataKey: "openai", value: 5100, color: "#00ff00" },
      { dataKey: "gemini", value: 2200, color: "#0000ff" },
    ];
    render(<UsageStackedTooltip active={true} payload={payload} label="Mar 2" />);
    expect(screen.getByText("Mar 2")).toBeTruthy();
    expect(screen.getByText("openai:")).toBeTruthy();
    expect(screen.getByText("5.1k")).toBeTruthy();
    expect(screen.getByText("gemini:")).toBeTruthy();
    expect(screen.getByText("2.2k")).toBeTruthy();
  });
});
