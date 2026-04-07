import { useCallback, useRef } from "react";
import { cn } from '../lib/utils.ts';

export type ReplayMarkerType = "event" | "error" | "milestone";

export interface ReplayMarker {
	/** Time offset in seconds. */
	time: number;
	label: string;
	type: ReplayMarkerType;
}

export interface ReplayTimelineProps {
	/** Total session duration in seconds. */
	duration: number;
	/** Current playback position in seconds. */
	currentTime: number;
	/** Called with the new time in seconds when the user scrubs. */
	onSeek: (time: number) => void;
	/** Optional event markers rendered as dots along the track. */
	markers?: ReplayMarker[];
}

const MARKER_COLORS: Record<ReplayMarkerType, string> = {
	event: "bg-blue-400",
	error: "bg-red-500",
	milestone: "bg-amber-400",
};

const MARKER_LABELS: Record<ReplayMarkerType, string> = {
	event: "Event",
	error: "Error",
	milestone: "Milestone",
};

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Horizontal timeline scrubber for session replay.
 * Click or drag anywhere on the track to seek.
 * Markers are rendered as colored dots with tooltip labels.
 */
export function ReplayTimeline({
	duration,
	currentTime,
	onSeek,
	markers = [],
}: ReplayTimelineProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);

	const safeDuration = Math.max(duration, 1);
	const progress = Math.min(1, Math.max(0, currentTime / safeDuration));

	const seekFromEvent = useCallback(
		(clientX: number) => {
			const track = trackRef.current;
			if (!track) return;
			const rect = track.getBoundingClientRect();
			const ratio = Math.min(
				1,
				Math.max(0, (clientX - rect.left) / rect.width),
			);
			onSeek(ratio * safeDuration);
		},
		[onSeek, safeDuration],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			isDragging.current = true;
			seekFromEvent(e.clientX);

			const onMove = (ev: MouseEvent) => {
				if (isDragging.current) seekFromEvent(ev.clientX);
			};
			const onUp = () => {
				isDragging.current = false;
				window.removeEventListener("mousemove", onMove);
				window.removeEventListener("mouseup", onUp);
			};
			window.addEventListener("mousemove", onMove);
			window.addEventListener("mouseup", onUp);
		},
		[seekFromEvent],
	);

	return (
		<div
			className="flex flex-col gap-1.5 select-none"
			role="slider"
			aria-label="Session replay timeline"
		>
			{/* Time labels */}
			<div className="flex justify-between px-1">
				<span className="font-mono text-[10px] text-muted-foreground">
					{formatTime(currentTime)}
				</span>
				<span className="font-mono text-[10px] text-muted-foreground">
					{formatTime(safeDuration)}
				</span>
			</div>

			{/* Track */}
			<div
				ref={trackRef}
				role="slider"
				aria-valuemin={0}
				aria-valuemax={safeDuration}
				aria-valuenow={Math.round(currentTime)}
				aria-label="Seek"
				tabIndex={0}
				className="relative h-2 cursor-pointer rounded-full bg-surface-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onMouseDown={handleMouseDown}
				onKeyDown={(e) => {
					if (e.key === "ArrowRight")
						{onSeek(Math.min(safeDuration, currentTime + 5));}
					if (e.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
				}}
			>
				{/* Filled portion */}
				<div
					className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
					style={{ width: `${progress * 100}%` }}
				/>

				{/* Scrub handle */}
				<div
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full border-2 border-primary bg-background shadow transition-transform hover:scale-125"
					style={{ left: `${progress * 100}%` }}
				/>

				{/* Markers */}
				{markers.map((marker, _i) => {
					const left = Math.min(1, Math.max(0, marker.time / safeDuration));
					return (
						<div
							key={`marker-${marker.time}-${marker.label}`}
							title={`${MARKER_LABELS[marker.type]}: ${marker.label} (${formatTime(marker.time)})`}
							className={cn(
								"group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full cursor-pointer z-10",
								MARKER_COLORS[marker.type],
							)}
							style={{ left: `${left * 100}%` }}
							onClick={(e) => {
								e.stopPropagation();
								onSeek(marker.time);
							}}
						>
							{/* Tooltip */}
							<div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap rounded bg-popover border border-border px-2 py-1 text-[10px] text-popover-foreground shadow-md flex-col items-center gap-0.5">
								<span className="font-medium">{marker.label}</span>
								<span className="text-muted-foreground">
									{formatTime(marker.time)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
