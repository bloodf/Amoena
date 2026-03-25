import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { runAmoena } from "@/lib/command";
import { config } from "@/lib/config";
import { getDatabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { parseAmoenaDoctorOutput } from "@/lib/amoena-doctor";
import { archiveOrphanTranscriptsForStateDir } from "@/lib/amoena-doctor-fix";

function getCommandDetail(error: unknown): {
	detail: string;
	code: number | null;
} {
	const err = error as {
		stdout?: string;
		stderr?: string;
		message?: string;
		code?: number | null;
	};

	return {
		detail: [err?.stdout, err?.stderr, err?.message]
			.filter(Boolean)
			.join("\n")
			.trim(),
		code: typeof err?.code === "number" ? err.code : null,
	};
}

function isMissingAmoena(detail: string): boolean {
	return /enoent|not installed|not reachable|command not found/i.test(detail);
}

export async function GET(request: Request) {
	const auth = requireRole(request, "admin");
	if ("error" in auth) {
		return NextResponse.json({ error: auth.error }, { status: auth.status });
	}

	try {
		const result = await runAmoena(["doctor"], { timeoutMs: 15000 });
		return NextResponse.json(
			parseAmoenaDoctorOutput(
				`${result.stdout}\n${result.stderr}`,
				result.code ?? 0,
				{
					stateDir: config.amoenaStateDir,
				},
			),
			{
				headers: { "Cache-Control": "no-store" },
			},
		);
	} catch (error) {
		const { detail, code } = getCommandDetail(error);
		if (isMissingAmoena(detail)) {
			return NextResponse.json(
				{ error: "Amoena is not installed or not reachable" },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			parseAmoenaDoctorOutput(detail, code ?? 1, {
				stateDir: config.amoenaStateDir,
			}),
			{
				headers: { "Cache-Control": "no-store" },
			},
		);
	}
}

export async function POST(request: Request) {
	const auth = requireRole(request, "admin");
	if ("error" in auth) {
		return NextResponse.json({ error: auth.error }, { status: auth.status });
	}

	try {
		const progress: Array<{ step: string; detail: string }> = [];

		const fixResult = await runAmoena(["doctor", "--fix"], {
			timeoutMs: 120000,
		});
		progress.push({
			step: "doctor",
			detail: "Applied Amoena doctor config fixes.",
		});

		try {
			await runAmoena(
				["sessions", "cleanup", "--all-agents", "--enforce", "--fix-missing"],
				{ timeoutMs: 120000 },
			);
			progress.push({
				step: "sessions",
				detail: "Pruned missing transcript entries from session stores.",
			});
		} catch (error) {
			const { detail } = getCommandDetail(error);
			progress.push({
				step: "sessions",
				detail: detail || "Session cleanup skipped.",
			});
		}

		const orphanFix = archiveOrphanTranscriptsForStateDir(
			config.amoenaStateDir,
		);
		progress.push({
			step: "orphans",
			detail:
				orphanFix.archivedOrphans > 0
					? `Archived ${orphanFix.archivedOrphans} orphan transcript file(s) across ${orphanFix.storesScanned} session store(s).`
					: `No orphan transcript files found across ${orphanFix.storesScanned} session store(s).`,
		});

		const postFix = await runAmoena(["doctor"], { timeoutMs: 15000 });
		const status = parseAmoenaDoctorOutput(
			`${postFix.stdout}\n${postFix.stderr}`,
			postFix.code ?? 0,
			{
				stateDir: config.amoenaStateDir,
			},
		);

		try {
			const db = getDatabase();
			db.prepare(
				"INSERT INTO audit_log (action, actor, detail) VALUES (?, ?, ?)",
			).run(
				"amoena.doctor.fix",
				auth.user.username,
				JSON.stringify({
					level: status.level,
					healthy: status.healthy,
					issues: status.issues,
				}),
			);
		} catch {
			// Non-critical.
		}

		return NextResponse.json({
			success: true,
			output: `${fixResult.stdout}\n${fixResult.stderr}`.trim(),
			progress,
			status,
		});
	} catch (error) {
		const { detail, code } = getCommandDetail(error);
		if (isMissingAmoena(detail)) {
			return NextResponse.json(
				{ error: "Amoena is not installed or not reachable" },
				{ status: 400 },
			);
		}

		logger.error({ err: error }, "Amoena doctor fix failed");

		return NextResponse.json(
			{
				error: "Amoena doctor fix failed",
				detail,
				status: parseAmoenaDoctorOutput(detail, code ?? 1, {
					stateDir: config.amoenaStateDir,
				}),
			},
			{ status: 500 },
		);
	}
}
