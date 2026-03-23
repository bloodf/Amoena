"use client";

import {
	type ReplayMarker,
	ReplayTimeline,
} from "@lunaria/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createClientLogger } from "@/lib/client-logger";

const log = createClientLogger("SessionReplay");

const SPEEDS = [0.5, 1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];

interface RecordingMeta {
	id: string;
	agentName: string;
	model: string;
	durationSeconds: number;
	costUsd: number;
	startedAt: number;
	finishedAt: number | null;
}

interface RecordingEvent {
	time: number;
	type: "tool_call" | "message" | "error" | "milestone";
	label: string;
	detail?: string;
}

interface Annotation {
	id: string;
	time: number;
	note: string;
	createdAt: number;
}

interface RecordingDetail extends RecordingMeta {
	events: RecordingEvent[];
	annotations: Annotation[];
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(unixSeconds: number): string {
	return new Date(unixSeconds * 1000).toLocaleString();
}

function formatCost(usd: number): string {
	if (usd === 0) return "$0.00";
	return `$${usd.toFixed(4)}`;
}

const EVENT_TYPE_COLORS: Record<RecordingEvent["type"], string> = {
	tool_call: "text-blue-400",
	message: "text-green-400",
	error: "text-red-400",
	milestone: "text-amber-400",
};

const EVENT_TYPE_LABELS: Record<RecordingEvent["type"], string> = {
	tool_call: "TOOL",
	message: "MSG",
	error: "ERR",
	milestone: "★",
};

export function SessionReplayPanel() {
	const [sessions, setSessions] = useState<RecordingMeta[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [recording, setRecording] = useState<RecordingDetail | null>(null);
	const [isLoadingSessions, setIsLoadingSessions] = useState(true);
	const [isLoadingRecording, setIsLoadingRecording] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState<Speed>(1);
	const [newNote, setNewNote] = useState("");
	const [annotations, setAnnotations] = useState<Annotation[]>([]);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const terminalRef = useRef<HTMLDivElement>(null);

	const loadSessions = useCallback(async () => {
		setIsLoadingSessions(true);
		try {
			const res = await fetch("/api/replay");
			if (!res.ok) throw new Error("Failed to fetch recordings");
			const data = await res.json();
			setSessions(data.recordings ?? []);
		} catch (error) {
			log.error("Failed to load recordings:", error);
			setSessions([]);
		} finally {
			setIsLoadingSessions(false);
		}
	}, []);

	useEffect(() => {
		loadSessions();
	}, [loadSessions]);

	const loadRecording = useCallback(async (id: string) => {
		setIsLoadingRecording(true);
		setIsPlaying(false);
		setCurrentTime(0);
		try {
			const res = await fetch(`/api/replay?id=${encodeURIComponent(id)}`);
			if (!res.ok) throw new Error("Failed to fetch recording");
			const data = await res.json();
			setRecording(data.recording);
			setAnnotations(data.recording.annotations ?? []);
		} catch (error) {
			log.error("Failed to load recording:", error);
			setRecording(null);
		} finally {
			setIsLoadingRecording(false);
		}
	}, []);

	const handleSelectSession = (id: string) => {
		setSelectedId(id);
		loadRecording(id);
	};

	// Playback ticker
	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		if (!isPlaying || !recording) return;

		intervalRef.current = setInterval(() => {
			setCurrentTime((prev) => {
				const next = prev + 0.1 * speed;
				if (next >= recording.durationSeconds) {
					setIsPlaying(false);
					return recording.durationSeconds;
				}
				return next;
			});
		}, 100);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [isPlaying, speed, recording]);

	// Auto-scroll terminal to bottom as time advances
	useEffect(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [currentTime]);

	const handleSeek = (time: number) => {
		setCurrentTime(time);
	};

	const handlePlayPause = () => {
		if (!recording) return;
		if (currentTime >= recording.durationSeconds) {
			setCurrentTime(0);
		}
		setIsPlaying((p) => !p);
	};

	const handleAddAnnotation = () => {
		if (!newNote.trim() || !recording) return;
		const annotation: Annotation = {
			id: `ann-${Date.now()}`,
			time: currentTime,
			note: newNote.trim(),
			createdAt: Math.floor(Date.now() / 1000),
		};
		setAnnotations((prev) => [...prev, annotation].sort((a, b) => a.time - b.time));
		setNewNote("");
	};

	const visibleEvents = recording
		? recording.events.filter((e) => e.time <= currentTime)
		: [];

	const markers: ReplayMarker[] = recording
		? recording.events.map((e) => ({
				time: e.time,
				label: e.label,
				type:
					e.type === "error"
						? "error"
						: e.type === "milestone"
							? "milestone"
							: "event",
			}))
		: [];

	const selectedMeta = sessions.find((s) => s.id === selectedId) ?? null;

	return (
		<div className="flex h-full p-6 gap-6">
			{/* Session list sidebar */}
			<div className="w-64 flex-shrink-0 flex flex-col gap-3">
				<div className="border-b border-border pb-3">
					<h2 className="text-lg font-semibold text-foreground">Recordings</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Recorded agent sessions
					</p>
				</div>

				{isLoadingSessions ? (
					<Loader variant="panel" label="Loading sessions" />
				) : sessions.length === 0 ? (
					<div className="flex-1 flex items-center justify-center text-center px-2">
						<p className="text-sm text-muted-foreground leading-relaxed">
							No recorded sessions yet. Sessions are recorded automatically when
							agents run.
						</p>
					</div>
				) : (
					<div className="flex-1 overflow-auto space-y-2">
						{sessions.map((s) => (
							<button
								key={s.id}
								onClick={() => handleSelectSession(s.id)}
								className={`w-full text-left p-3 rounded-lg border transition-all ${
									selectedId === s.id
										? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
										: "border-border bg-card hover:border-primary/20"
								}`}
							>
								<div className="font-medium text-sm text-foreground truncate">
									{s.agentName || "Unknown agent"}
								</div>
								<div className="text-xs text-muted-foreground mt-0.5 truncate">
									{s.model}
								</div>
								<div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
									<span>{formatDuration(s.durationSeconds)}</span>
									<span>{formatCost(s.costUsd)}</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Main replay area */}
			<div className="flex-1 min-w-0 flex flex-col gap-4">
				{!selectedId ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground text-sm">
							Select a session to replay
						</p>
					</div>
				) : isLoadingRecording ? (
					<Loader variant="panel" label="Loading recording" />
				) : !recording ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground text-sm">
							Failed to load recording
						</p>
					</div>
				) : (
					<>
						{/* Metadata header */}
						{selectedMeta && (
							<div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-6 text-sm">
								<div>
									<div className="text-xs text-muted-foreground">Agent</div>
									<div className="font-medium text-foreground mt-0.5">
										{selectedMeta.agentName || "Unknown"}
									</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Model</div>
									<div className="font-medium text-foreground mt-0.5">
										{selectedMeta.model}
									</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Duration</div>
									<div className="font-medium text-foreground mt-0.5">
										{formatDuration(selectedMeta.durationSeconds)}
									</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Cost</div>
									<div className="font-medium text-foreground mt-0.5">
										{formatCost(selectedMeta.costUsd)}
									</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Date</div>
									<div className="font-medium text-foreground mt-0.5">
										{formatDate(selectedMeta.startedAt)}
									</div>
								</div>
							</div>
						)}

						{/* Timeline */}
						<div className="bg-card border border-border rounded-lg p-4 space-y-3">
							<ReplayTimeline
								duration={recording.durationSeconds}
								currentTime={currentTime}
								onSeek={handleSeek}
								markers={markers}
							/>

							{/* Controls */}
							<div className="flex items-center gap-3">
								<Button
									onClick={handlePlayPause}
									className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 min-w-[80px]"
								>
									{isPlaying ? "Pause" : currentTime >= recording.durationSeconds ? "Replay" : "Play"}
								</Button>

								<div className="flex items-center gap-1.5">
									{SPEEDS.map((s) => (
										<button
											key={s}
											onClick={() => setSpeed(s)}
											className={`px-2 py-1 rounded text-xs border transition-all ${
												speed === s
													? "bg-primary/20 text-primary border-primary/30"
													: "bg-secondary text-muted-foreground border-border hover:text-foreground"
											}`}
										>
											{s}x
										</button>
									))}
								</div>

								<span className="ml-auto text-xs text-muted-foreground font-mono">
									{recording.events.length} events
								</span>
							</div>
						</div>

						{/* Terminal + Annotations */}
						<div className="flex-1 min-h-0 flex gap-4">
							{/* Terminal output */}
							<div className="flex-1 min-w-0 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
								<div className="px-4 py-2 border-b border-border flex items-center gap-2">
									<span className="size-2 rounded-full bg-green-500" />
									<span className="text-xs text-muted-foreground font-mono">
										Agent actions
									</span>
								</div>
								<div
									ref={terminalRef}
									className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1.5"
								>
									{visibleEvents.length === 0 ? (
										<span className="text-muted-foreground">
											{isPlaying ? "Waiting for events..." : "Press Play to start"}
										</span>
									) : (
										visibleEvents.map((event, i) => (
											<div
												key={`${event.time}-${i}`}
												className="flex items-start gap-2"
											>
												<span className="text-muted-foreground shrink-0">
													{formatDuration(event.time)}
												</span>
												<span
													className={`shrink-0 font-medium ${EVENT_TYPE_COLORS[event.type]}`}
												>
													[{EVENT_TYPE_LABELS[event.type]}]
												</span>
												<span className="text-foreground break-words min-w-0">
													{event.label}
													{event.detail && (
														<span className="text-muted-foreground ml-1">
															— {event.detail}
														</span>
													)}
												</span>
											</div>
										))
									)}
								</div>
							</div>

							{/* Annotations sidebar */}
							<div className="w-56 flex-shrink-0 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
								<div className="px-4 py-2 border-b border-border">
									<span className="text-xs text-muted-foreground font-medium">
										Annotations
									</span>
								</div>
								<div className="flex-1 overflow-auto p-3 space-y-2">
									{annotations.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											No annotations yet
										</p>
									) : (
										annotations.map((ann) => (
											<div
												key={ann.id}
												className="p-2 rounded border border-border bg-secondary/30 text-xs space-y-0.5 cursor-pointer hover:border-primary/30 transition-colors"
												onClick={() => handleSeek(ann.time)}
											>
												<div className="font-mono text-muted-foreground">
													{formatDuration(ann.time)}
												</div>
												<div className="text-foreground break-words">
													{ann.note}
												</div>
											</div>
										))
									)}
								</div>
								<div className="p-3 border-t border-border space-y-2">
									<input
										type="text"
										value={newNote}
										onChange={(e) => setNewNote(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAddAnnotation();
										}}
										placeholder="Note at current time…"
										className="w-full px-2 py-1.5 text-xs rounded border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
									/>
									<Button
										onClick={handleAddAnnotation}
										disabled={!newNote.trim()}
										className="w-full text-xs bg-secondary text-foreground border border-border hover:bg-secondary/80 disabled:opacity-40"
									>
										Add note
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
