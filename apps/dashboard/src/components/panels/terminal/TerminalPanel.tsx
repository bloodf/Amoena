"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const TERMINAL_HOST_PORT = process.env.NEXT_PUBLIC_TERMINAL_HOST_PORT ?? "4879";
const TERMINAL_WS_URL = `ws://localhost:${TERMINAL_HOST_PORT}`;

interface TerminalSession {
	id: string;
	command: string;
	status: "running" | "exited";
}

export function TerminalPanel() {
	const terminalRef = useRef<HTMLDivElement>(null);
	const xtermRef = useRef<any>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const [sessions, setSessions] = useState<TerminalSession[]>([]);
	const [activeSession, setActiveSession] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [xtermLoaded, setXtermLoaded] = useState(false);

	// Lazy-load xterm.js (heavy dependency, only load when panel is visible)
	useEffect(() => {
		let mounted = true;
		async function loadXterm() {
			try {
				const { Terminal } = await import("@xterm/xterm");
				const { FitAddon } = await import("@xterm/addon-fit");

				if (!mounted || !terminalRef.current) return;

				const terminal = new Terminal({
					cursorBlink: true,
					fontSize: 13,
					fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
					theme: {
						background: "#0a0a0a",
						foreground: "#e4e4e7",
						cursor: "#e4e4e7",
						selectionBackground: "#27272a",
						black: "#09090b",
						red: "#ef4444",
						green: "#22c55e",
						yellow: "#eab308",
						blue: "#3b82f6",
						magenta: "#a855f7",
						cyan: "#06b6d4",
						white: "#e4e4e7",
					},
				});

				const fitAddon = new FitAddon();
				terminal.loadAddon(fitAddon);
				terminal.open(terminalRef.current);
				fitAddon.fit();

				// Handle window resize
				const resizeObserver = new ResizeObserver(() => {
					fitAddon.fit();
				});
				resizeObserver.observe(terminalRef.current);

				// Forward terminal input to WebSocket
				terminal.onData((data: string) => {
					if (wsRef.current?.readyState === WebSocket.OPEN) {
						wsRef.current.send(JSON.stringify({ type: "input", data }));
					}
				});

				xtermRef.current = terminal;
				setXtermLoaded(true);

				terminal.writeln("\x1b[1;36m  Lunaria Terminal\x1b[0m");
				terminal.writeln("\x1b[2m  Ready. Spawn an agent or open a shell.\x1b[0m");
				terminal.writeln("");

				return () => {
					resizeObserver.disconnect();
					terminal.dispose();
				};
			} catch (err) {
				console.error("[terminal] Failed to load xterm.js:", err);
			}
		}

		loadXterm();
		return () => {
			mounted = false;
		};
	}, []);

	const connectToSession = useCallback(
		(sessionId: string) => {
			if (wsRef.current) {
				wsRef.current.close();
			}

			const ws = new WebSocket(`${TERMINAL_WS_URL}/terminal/${sessionId}`);

			ws.onopen = () => {
				setIsConnected(true);
				setActiveSession(sessionId);
				xtermRef.current?.clear();
				xtermRef.current?.writeln(
					`\x1b[2m  Connected to session ${sessionId}\x1b[0m\n`,
				);
			};

			ws.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				if (msg.type === "output" && xtermRef.current) {
					xtermRef.current.write(msg.data);
				}
			};

			ws.onclose = () => {
				setIsConnected(false);
				xtermRef.current?.writeln("\n\x1b[2m  Session disconnected.\x1b[0m");
			};

			ws.onerror = () => {
				setIsConnected(false);
			};

			wsRef.current = ws;
		},
		[],
	);

	const spawnShell = useCallback(async () => {
		try {
			const res = await fetch("/api/terminal/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					command: process.env.SHELL ?? "/bin/zsh",
					cwd: process.env.HOME,
				}),
			});
			const data = await res.json();
			if (data.result?.data?.json?.sessionId) {
				connectToSession(data.result.data.json.sessionId);
			}
		} catch (err) {
			console.error("[terminal] Failed to spawn shell:", err);
		}
	}, [connectToSession]);

	return (
		<div className="flex h-full flex-col bg-[#0a0a0a]">
			{/* Terminal toolbar */}
			<div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-1.5">
				<span className="text-xs font-medium text-zinc-400">Terminal</span>
				<div className="flex-1" />
				<div
					className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-zinc-600"}`}
				/>
				<Button variant="ghost" size="xs" onClick={spawnShell}>
					+ Shell
				</Button>
			</div>

			{/* Terminal viewport */}
			<div ref={terminalRef} className="flex-1 p-1" />
		</div>
	);
}
