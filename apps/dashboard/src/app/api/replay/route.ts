import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { readLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
	const auth = requireRole(request, "viewer");
	if ("error" in auth)
		return NextResponse.json({ error: auth.error }, { status: auth.status });

	const rateCheck = readLimiter(request);
	if (rateCheck)
		return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	try {
		const db = getDatabase();

		// Ensure recordings table exists (lazy creation — migration may not have run yet)
		db.exec(`
			CREATE TABLE IF NOT EXISTS recordings (
				id TEXT PRIMARY KEY,
				agent_name TEXT NOT NULL DEFAULT '',
				model TEXT NOT NULL DEFAULT '',
				duration_seconds REAL NOT NULL DEFAULT 0,
				cost_usd REAL NOT NULL DEFAULT 0,
				started_at INTEGER NOT NULL DEFAULT (unixepoch()),
				finished_at INTEGER,
				events TEXT NOT NULL DEFAULT '[]',
				annotations TEXT NOT NULL DEFAULT '[]'
			)
		`);
		db.exec(
			`CREATE INDEX IF NOT EXISTS idx_recordings_started ON recordings(started_at DESC)`,
		);

		if (id) {
			const row = db
				.prepare("SELECT * FROM recordings WHERE id = ?")
				.get(id) as RecordingRow | undefined;

			if (!row) {
				return NextResponse.json(
					{ error: "Recording not found" },
					{ status: 404 },
				);
			}

			return NextResponse.json({ recording: deserializeRecording(row) });
		}

		// List all recordings newest first
		const rows = db
			.prepare(
				"SELECT id, agent_name, model, duration_seconds, cost_usd, started_at, finished_at FROM recordings ORDER BY started_at DESC LIMIT 100",
			)
			.all() as RecordingRow[];

		return NextResponse.json({
			recordings: rows.map((r) => ({
				id: r.id,
				agentName: r.agent_name,
				model: r.model,
				durationSeconds: r.duration_seconds,
				costUsd: r.cost_usd,
				startedAt: r.started_at,
				finishedAt: r.finished_at ?? null,
			})),
		});
	} catch (error) {
		logger.error({ err: error }, "Replay API error");
		return NextResponse.json(
			{ error: "Failed to load recordings" },
			{ status: 500 },
		);
	}
}

interface RecordingRow {
	id: string;
	agent_name: string;
	model: string;
	duration_seconds: number;
	cost_usd: number;
	started_at: number;
	finished_at?: number | null;
	events?: string;
	annotations?: string;
}

function deserializeRecording(row: RecordingRow) {
	let events: RecordingEvent[] = [];
	let annotations: Annotation[] = [];

	try {
		events = JSON.parse(row.events ?? "[]");
	} catch {
		events = [];
	}

	try {
		annotations = JSON.parse(row.annotations ?? "[]");
	} catch {
		annotations = [];
	}

	return {
		id: row.id,
		agentName: row.agent_name,
		model: row.model,
		durationSeconds: row.duration_seconds,
		costUsd: row.cost_usd,
		startedAt: row.started_at,
		finishedAt: row.finished_at ?? null,
		events,
		annotations,
	};
}

export interface RecordingEvent {
	time: number;
	type: "tool_call" | "message" | "error" | "milestone";
	label: string;
	detail?: string;
}

export interface Annotation {
	id: string;
	time: number;
	note: string;
	createdAt: number;
}
