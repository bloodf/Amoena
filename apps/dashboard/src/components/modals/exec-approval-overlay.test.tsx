// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/store", () => ({
	useAmoena: () => ({
		execApprovals: [],
		updateExecApproval: vi.fn(),
	}),
}));

vi.mock("@/lib/websocket", () => ({
	useWebSocket: () => ({
		sendMessage: vi.fn(),
	}),
}));

afterEach(() => cleanup());

describe("ExecApprovalOverlay", () => {
	it("renders nothing when no pending approvals", async () => {
		const { ExecApprovalOverlay } = await import("./exec-approval-overlay");
		const { container } = render(<ExecApprovalOverlay />);
		// No pending approvals, should render nothing visible
		expect(container.children.length).toBeLessThanOrEqual(1);
	});
});
