import { describe, expect, it, mock } from "bun:test";
import { EventEmitter } from "node:events";

// Mock all terminal dependencies
const mockTerminal = Object.assign(new EventEmitter(), {
	createOrAttach: mock(() =>
		Promise.resolve({
			isNew: true,
			scrollback: "",
			wasRecovered: false,
			isColdRestore: false,
			previousCwd: null,
			snapshot: null,
		}),
	),
	cancelCreateOrAttach: mock(() => {}),
	write: mock(() => {}),
	resize: mock(() => {}),
	signal: mock(() => {}),
	kill: mock(() => Promise.resolve()),
	detach: mock(() => {}),
	clearScrollback: mock(() => Promise.resolve()),
	ackColdRestore: mock(() => {}),
	getSession: mock(() => Promise.resolve(null)),
	capabilities: { daemon: true },
	management: {
		listSessions: mock(() => Promise.resolve({ sessions: [] })),
		resetHistoryPersistence: mock(() => Promise.resolve()),
	},
});

mock.module("main/lib/workspace-runtime", () => ({
	getWorkspaceRuntimeRegistry: () => ({
		getDefault: () => ({ terminal: mockTerminal }),
	}),
}));

mock.module("main/lib/app-state", () => ({
	appState: { data: { themeState: null } },
}));

mock.module("main/lib/terminal", () => ({
	restartDaemon: mock(() => Promise.resolve({ success: true })),
}));

mock.module("main/lib/terminal/errors", () => ({
	isTerminalAttachCanceledError: () => false,
	TERMINAL_ATTACH_CANCELED_MESSAGE: "Attach canceled",
	TERMINAL_SESSION_KILLED_MESSAGE: "Session killed",
	TerminalKilledError: class extends Error {},
}));

mock.module("main/lib/terminal-host/client", () => ({
	getTerminalHostClient: () => ({
		listSessions: mock(() => Promise.resolve({ sessions: [] })),
	}),
}));

mock.module("./theme-type", () => ({
	resolveTerminalThemeType: mock(() => "dark"),
}));

mock.module("./utils", () => ({
	getWorkspaceTerminalContext: mock(() => ({
		workspace: { name: "test-ws", type: "worktree" },
		workspacePath: "/repo",
		rootPath: "/repo",
	})),
	resolveCwd: mock((_override: string | undefined, path: string) => path),
}));

mock.module("../workspaces/utils/usability", () => ({
	assertWorkspaceUsable: mock(() => {}),
}));

const { createTerminalRouter } = await import("./terminal");

describe("terminal router", () => {
	it("creates a router with expected shape", () => {
		const router = createTerminalRouter();
		expect(router).toBeDefined();
		expect(typeof router).toBe("object");
	});
});
