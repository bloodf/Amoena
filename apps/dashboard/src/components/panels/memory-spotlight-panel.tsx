"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigateToPanel } from "@/lib/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResultType = "memory" | "session" | "agent" | "task";

interface SpotlightResult {
	id: string;
	type: ResultType;
	title: string;
	snippet: string;
	timestamp?: number;
	panel: string;
}

interface GroupedResults {
	label: string;
	type: ResultType;
	items: SpotlightResult[];
}

const RECENT_SEARCHES_KEY = "amoena:spotlight:recent";
const MAX_RECENT = 5;

const TYPE_LABELS: Record<ResultType, string> = {
	memory: "Memory",
	session: "Session",
	agent: "Agent",
	task: "Task",
};

const TYPE_BADGE_CLASSES: Record<ResultType, string> = {
	memory: "bg-violet-500/20 text-violet-400",
	session: "bg-blue-500/20 text-blue-400",
	agent: "bg-emerald-500/20 text-emerald-400",
	task: "bg-amber-500/20 text-amber-400",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelative(ts?: number): string {
	if (!ts) return "";
	const diff = Date.now() - ts;
	const s = Math.floor(diff / 1000);
	if (s < 60) return "just now";
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

function loadRecentSearches(): string[] {
	try {
		const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

function saveRecentSearch(query: string): void {
	try {
		const existing = loadRecentSearches().filter((q) => q !== query);
		const updated = [query, ...existing].slice(0, MAX_RECENT);
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
	} catch {
		// ignore storage errors
	}
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchResults(query: string): Promise<SpotlightResult[]> {
	const results: SpotlightResult[] = [];

	const [memRes, searchRes] = await Promise.allSettled([
		fetch(`/api/memory/search?q=${encodeURIComponent(query)}&limit=5`),
		fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`),
	]);

	if (memRes.status === "fulfilled" && memRes.value.ok) {
		const data = await memRes.value.json().catch(() => ({}));
		const entries: Array<{ id?: string | number; key?: string; value?: string; content?: string; updated_at?: number; created_at?: number }> =
			Array.isArray(data?.results) ? data.results : Array.isArray(data?.memories) ? data.memories : [];
		for (const entry of entries) {
			results.push({
				id: `memory-${entry.id ?? entry.key ?? Math.random()}`,
				type: "memory",
				title: String(entry.key ?? entry.id ?? "Memory entry"),
				snippet: String(entry.value ?? entry.content ?? "").slice(0, 120),
				timestamp: entry.updated_at ?? entry.created_at,
				panel: "memory",
			});
		}
	}

	if (searchRes.status === "fulfilled" && searchRes.value.ok) {
		const data = await searchRes.value.json().catch(() => ({}));
		const agents: Array<{ id?: string | number; name?: string; role?: string; status?: string; updated_at?: number }> =
			Array.isArray(data?.agents) ? data.agents : [];
		const tasks: Array<{ id?: string | number; title?: string; description?: string; status?: string; updated_at?: number }> =
			Array.isArray(data?.tasks) ? data.tasks : [];
		const sessions: Array<{ id?: string | number; title?: string; summary?: string; updated_at?: number }> =
			Array.isArray(data?.sessions) ? data.sessions : [];

		for (const agent of agents.slice(0, 5)) {
			results.push({
				id: `agent-${agent.id}`,
				type: "agent",
				title: String(agent.name ?? `Agent ${agent.id}`),
				snippet: `${agent.role ?? ""} · ${agent.status ?? ""}`.trim().replace(/^·\s*/, ""),
				timestamp: agent.updated_at,
				panel: "agents",
			});
		}

		for (const task of tasks.slice(0, 5)) {
			results.push({
				id: `task-${task.id}`,
				type: "task",
				title: String(task.title ?? `Task ${task.id}`),
				snippet: String(task.description ?? task.status ?? "").slice(0, 120),
				timestamp: task.updated_at,
				panel: "tasks",
			});
		}

		for (const session of sessions.slice(0, 3)) {
			results.push({
				id: `session-${session.id}`,
				type: "session",
				title: String(session.title ?? `Session ${session.id}`),
				snippet: String(session.summary ?? "").slice(0, 120),
				timestamp: session.updated_at,
				panel: "chat",
			});
		}
	}

	return results;
}

function groupResults(results: SpotlightResult[]): GroupedResults[] {
	const order: ResultType[] = ["memory", "session", "agent", "task"];
	return order
		.map((type) => ({
			label: `${TYPE_LABELS[type]}s`,
			type,
			items: results.filter((r) => r.type === type),
		}))
		.filter((g) => g.items.length > 0);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypeBadge({ type }: { type: ResultType }) {
	return (
		<span
			className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGE_CLASSES[type]}`}
		>
			{TYPE_LABELS[type]}
		</span>
	);
}

function ResultRow({
	result,
	isSelected,
	onSelect,
	onHover,
}: {
	result: SpotlightResult;
	isSelected: boolean;
	onSelect: () => void;
	onHover: () => void;
}) {
	const ref = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (isSelected) {
			ref.current?.scrollIntoView({ block: "nearest" });
		}
	}, [isSelected]);

	return (
		<button
			ref={ref}
			type="button"
			className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
				isSelected ? "bg-accent" : "hover:bg-accent/50"
			}`}
			onClick={onSelect}
			onMouseEnter={onHover}
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-foreground truncate">
						{result.title}
					</span>
					<TypeBadge type={result.type} />
				</div>
				{result.snippet && (
					<p className="text-xs text-muted-foreground truncate mt-0.5">
						{result.snippet}
					</p>
				)}
			</div>
			{result.timestamp ? (
				<span className="text-[11px] text-muted-foreground/60 shrink-0 mt-0.5">
					{formatRelative(result.timestamp)}
				</span>
			) : null}
		</button>
	);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MemorySpotlightPanel({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const navigateToPanel = useNavigateToPanel();
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SpotlightResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	const groups = groupResults(results);
	const flatResults = groups.flatMap((g) => g.items);

	// Focus input when opened
	useEffect(() => {
		if (open) {
			setQuery("");
			setResults([]);
			setSelectedIndex(0);
			setRecentSearches(loadRecentSearches());
			const t = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(t);
		}
	}, [open]);

	// Search with debounce
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		const timer = setTimeout(async () => {
			try {
				const found = await fetchResults(query.trim());
				setResults(found);
				setSelectedIndex(0);
			} catch {
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	const handleSelect = useCallback(
		(result: SpotlightResult) => {
			if (query.trim()) saveRecentSearch(query.trim());
			onClose();
			navigateToPanel(result.panel);
		},
		[query, onClose, navigateToPanel],
	);

	const handleRecentSelect = useCallback(
		(recent: string) => {
			setQuery(recent);
			inputRef.current?.focus();
		},
		[],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => Math.max(i - 1, 0));
				return;
			}
			if (e.key === "Enter") {
				e.preventDefault();
				const result = flatResults[selectedIndex];
				if (result) handleSelect(result);
			}
		},
		[flatResults, selectedIndex, handleSelect, onClose],
	);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
			role="dialog"
			aria-modal="true"
			aria-label="Search everything"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Panel */}
			<div
				className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
				onKeyDown={handleKeyDown}
			>
				{/* Search input */}
				<div className="flex items-center gap-3 px-4 py-3 border-b border-border">
					<svg
						className="w-4 h-4 text-muted-foreground shrink-0"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<circle cx="6.5" cy="6.5" r="4.5" />
						<path d="M10.5 10.5l3 3" strokeLinecap="round" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search everything..."
						className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
						autoComplete="off"
						spellCheck={false}
					/>
					{loading && (
						<div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin shrink-0" />
					)}
					<kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
						Esc
					</kbd>
				</div>

				{/* Results */}
				<div className="max-h-[360px] overflow-y-auto">
					{!query.trim() && recentSearches.length > 0 && (
						<div className="py-2">
							<p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Recent Searches
							</p>
							{recentSearches.map((recent) => (
								<button
									key={recent}
									type="button"
									className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-foreground hover:bg-accent/50 transition-colors"
									onClick={() => handleRecentSelect(recent)}
								>
									<svg
										className="w-3.5 h-3.5 text-muted-foreground shrink-0"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<circle cx="8" cy="8" r="6" />
										<path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									{recent}
								</button>
							))}
						</div>
					)}

					{!query.trim() && recentSearches.length === 0 && (
						<div className="py-10 text-center text-sm text-muted-foreground">
							Type to search memories, sessions, agents, and tasks
						</div>
					)}

					{query.trim() && !loading && flatResults.length === 0 && (
						<div className="py-10 text-center text-sm text-muted-foreground">
							No results for &ldquo;{query}&rdquo;
						</div>
					)}

					{groups.map((group) => {
						const groupOffset = groups
							.slice(0, groups.indexOf(group))
							.reduce((acc, g) => acc + g.items.length, 0);

						return (
							<div key={group.type} className="py-1">
								<p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
									{group.label}
								</p>
								{group.items.map((result, idx) => (
									<ResultRow
										key={result.id}
										result={result}
										isSelected={selectedIndex === groupOffset + idx}
										onSelect={() => handleSelect(result)}
										onHover={() => setSelectedIndex(groupOffset + idx)}
									/>
								))}
							</div>
						);
					})}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
					<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
						<span className="flex items-center gap-1">
							<kbd className="rounded border border-border bg-muted px-1 py-0.5">↑↓</kbd>
							navigate
						</span>
						<span className="flex items-center gap-1">
							<kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd>
							open
						</span>
					</div>
					<span className="text-[11px] text-muted-foreground">
						{flatResults.length > 0 ? `${flatResults.length} result${flatResults.length !== 1 ? "s" : ""}` : ""}
					</span>
				</div>
			</div>
		</div>
	);
}
