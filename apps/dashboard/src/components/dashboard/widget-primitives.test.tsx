// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	MetricCard,
	SignalPill,
	HealthRow,
	StatRow,
	LogRow,
	QuickAction,
	formatUptime,
	formatTokensShort,
	formatBytes,
	getProviderHealth,
	getLocalOsStatus,
	getMcHealth,
} from "./widget-primitives";

afterEach(() => cleanup());

describe("MetricCard", () => {
	it("renders label and value", () => {
		render(
			<MetricCard label="Sessions" value={42} icon={<span>I</span>} color="blue" />,
		);
		expect(screen.getByText("Sessions")).toBeDefined();
		expect(screen.getByText("42")).toBeDefined();
	});

	it("renders total when provided", () => {
		render(
			<MetricCard label="Active" value={3} total={10} icon={<span>I</span>} color="green" />,
		);
		expect(screen.getByText("/ 10")).toBeDefined();
	});

	it("renders subtitle when provided", () => {
		render(
			<MetricCard label="Tasks" value={5} subtitle="running" icon={<span>I</span>} color="purple" />,
		);
		expect(screen.getByText("running")).toBeDefined();
	});
});

describe("SignalPill", () => {
	it("renders label and value", () => {
		render(<SignalPill label="Status" value="Healthy" tone="success" />);
		expect(screen.getByText("Status")).toBeDefined();
		expect(screen.getByText("Healthy")).toBeDefined();
	});

	it("applies success tone styles", () => {
		const { container } = render(
			<SignalPill label="s" value="v" tone="success" />,
		);
		expect(container.firstElementChild?.className).toContain("bg-green");
	});

	it("applies warning tone styles", () => {
		const { container } = render(
			<SignalPill label="s" value="v" tone="warning" />,
		);
		expect(container.firstElementChild?.className).toContain("bg-amber");
	});
});

describe("HealthRow", () => {
	it("renders label and value", () => {
		render(<HealthRow label="CPU" value="45%" status="good" />);
		expect(screen.getByText("CPU")).toBeDefined();
		expect(screen.getByText("45%")).toBeDefined();
	});

	it("applies good status color", () => {
		const { container } = render(
			<HealthRow label="CPU" value="ok" status="good" />,
		);
		expect(container.querySelector(".text-green-400")).not.toBeNull();
	});

	it("applies warn status color", () => {
		const { container } = render(
			<HealthRow label="MEM" value="80%" status="warn" />,
		);
		expect(container.querySelector(".text-amber-400")).not.toBeNull();
	});

	it("applies bad status color", () => {
		const { container } = render(
			<HealthRow label="DISK" value="95%" status="bad" />,
		);
		expect(container.querySelector(".text-red-400")).not.toBeNull();
	});

	it("renders progress bar when bar prop is given", () => {
		const { container } = render(
			<HealthRow label="MEM" value="70%" status="good" bar={70} />,
		);
		const bar = container.querySelector("[style]");
		expect(bar).not.toBeNull();
	});
});

describe("StatRow", () => {
	it("renders label and value", () => {
		render(<StatRow label="Total" value={100} />);
		expect(screen.getByText("Total")).toBeDefined();
		expect(screen.getByText("100")).toBeDefined();
	});

	it("applies alert color when alert is true", () => {
		const { container } = render(
			<StatRow label="Errors" value={5} alert={true} />,
		);
		expect(container.querySelector(".text-red-400")).not.toBeNull();
	});
});

describe("LogRow", () => {
	it("renders log message", () => {
		render(
			<LogRow
				log={{
					id: "1",
					timestamp: Date.now(),
					level: "info",
					source: "gateway",
					message: "Connection established",
				}}
			/>,
		);
		expect(screen.getByText("Connection established")).toBeDefined();
		expect(screen.getByText("gateway")).toBeDefined();
	});

	it("truncates long messages", () => {
		const longMsg = "a".repeat(150);
		render(
			<LogRow
				log={{
					id: "2",
					timestamp: Date.now(),
					level: "error",
					source: "api",
					message: longMsg,
				}}
			/>,
		);
		const el = screen.getByText(/^a+\.\.\.$/);
		expect(el).toBeDefined();
	});

	it("applies error dot color", () => {
		const { container } = render(
			<LogRow
				log={{ id: "3", timestamp: Date.now(), level: "error", source: "api", message: "err" }}
			/>,
		);
		expect(container.querySelector(".bg-red-500")).not.toBeNull();
	});
});

describe("QuickAction", () => {
	it("renders label and description", () => {
		render(
			<QuickAction label="View Logs" desc="Check system logs" tab="logs" icon={<span />} onNavigate={() => {}} />,
		);
		expect(screen.getByText("View Logs")).toBeDefined();
		expect(screen.getByText("Check system logs")).toBeDefined();
	});

	it("calls onNavigate with tab on click", () => {
		const onNavigate = vi.fn();
		render(
			<QuickAction label="Logs" desc="d" tab="logs" icon={<span />} onNavigate={onNavigate} />,
		);
		fireEvent.click(screen.getByText("Logs"));
		expect(onNavigate).toHaveBeenCalledWith("logs");
	});
});

describe("formatUptime", () => {
	it("formats hours", () => {
		expect(formatUptime(3600000)).toBe("1h");
	});

	it("formats days and hours", () => {
		expect(formatUptime(90000000)).toBe("1d 1h");
	});
});

describe("formatTokensShort", () => {
	it("formats millions", () => {
		expect(formatTokensShort(1_500_000)).toBe("1.5M");
	});

	it("formats thousands", () => {
		expect(formatTokensShort(2_500)).toBe("3K");
	});

	it("returns raw number for small values", () => {
		expect(formatTokensShort(42)).toBe("42");
	});
});

describe("formatBytes", () => {
	it("returns 0 B for zero", () => {
		expect(formatBytes(0)).toBe("0 B");
	});

	it("formats KB", () => {
		expect(formatBytes(2048)).toBe("2 KB");
	});

	it("formats MB", () => {
		expect(formatBytes(1048576)).toBe("1 MB");
	});
});

describe("getProviderHealth", () => {
	it("returns good when active > 0", () => {
		expect(getProviderHealth(2, 5).status).toBe("good");
	});

	it("returns warn when no sessions", () => {
		expect(getProviderHealth(0, 0).status).toBe("warn");
	});

	it("returns warn when idle", () => {
		expect(getProviderHealth(0, 3).status).toBe("warn");
	});
});

describe("getLocalOsStatus", () => {
	it("returns good when low usage", () => {
		expect(getLocalOsStatus(30, 40).status).toBe("good");
	});

	it("returns warn when usage >= 80", () => {
		expect(getLocalOsStatus(85, 40).status).toBe("warn");
	});

	it("returns bad when usage >= 95", () => {
		expect(getLocalOsStatus(96, 40).status).toBe("bad");
	});

	it("returns bad when both null", () => {
		expect(getLocalOsStatus(null, null).status).toBe("bad");
	});
});

describe("getMcHealth", () => {
	it("returns bad when no systemStats", () => {
		expect(getMcHealth(null, null, 0).status).toBe("bad");
	});

	it("returns warn when errors > 0", () => {
		expect(getMcHealth({}, {} as any, 3).status).toBe("warn");
	});

	it("returns good when healthy", () => {
		expect(getMcHealth({}, {} as any, 0).status).toBe("good");
	});
});
