import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { logger } from "@/lib/logger";
import { mutationLimiter, readLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonaRow {
	id: string;
	name: string;
	system_prompt: string;
	temperature: number;
	top_p: number;
	model: string;
	constraints: string; // JSON array
	is_builtin: 0 | 1;
	workspace_id: number;
	created_at: number;
	updated_at: number;
}

// ---------------------------------------------------------------------------
// Built-in personas (mirrors packages/amoena-service/src/opinions/persona.ts)
// ---------------------------------------------------------------------------

const BUILTIN_PERSONAS = [
	{
		id: "default",
		name: "Default",
		system_prompt:
			"You are a helpful AI assistant. Follow instructions carefully and ask for clarification when unsure.",
		temperature: 0.7,
		top_p: 0.95,
		model: "claude-sonnet-4-6",
		constraints: [],
		is_builtin: true,
	},
	{
		id: "cautious",
		name: "Cautious",
		system_prompt:
			"You are a conservative AI assistant. Prefer safe, reversible actions. " +
			"Always confirm before making destructive changes. Explain trade-offs explicitly.",
		temperature: 0.2,
		top_p: 0.8,
		model: "claude-sonnet-4-6",
		constraints: ["require_confirmation_before_write", "no_destructive_commands"],
		is_builtin: true,
	},
	{
		id: "creative",
		name: "Creative",
		system_prompt:
			"You are an inventive AI assistant. Explore unconventional solutions and generate " +
			"diverse alternatives before settling on an approach.",
		temperature: 1.2,
		top_p: 0.98,
		model: "claude-sonnet-4-6",
		constraints: [],
		is_builtin: true,
	},
	{
		id: "fast",
		name: "Fast",
		system_prompt:
			"You are a concise AI assistant optimized for speed. Deliver direct answers with " +
			"minimal explanation. Skip preamble and post-amble.",
		temperature: 0.3,
		top_p: 0.85,
		model: "claude-haiku-4-5",
		constraints: ["brief_responses"],
		is_builtin: true,
	},
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensurePersonasTable(db: ReturnType<typeof getDatabase>): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      system_prompt TEXT NOT NULL DEFAULT '',
      temperature REAL NOT NULL DEFAULT 0.7,
      top_p REAL NOT NULL DEFAULT 0.95,
      model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
      constraints TEXT NOT NULL DEFAULT '[]',
      is_builtin INTEGER NOT NULL DEFAULT 0,
      workspace_id INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (id, workspace_id)
    )
  `);
}

function mapRow(row: PersonaRow) {
	return {
		id: row.id,
		name: row.name,
		systemPrompt: row.system_prompt,
		temperature: row.temperature,
		topP: row.top_p,
		model: row.model,
		constraints: JSON.parse(row.constraints || "[]") as string[],
		isBuiltin: row.is_builtin === 1,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

// ---------------------------------------------------------------------------
// GET /api/personas — list all (built-in + custom)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
	const auth = requireRole(request, "viewer");
	if ("error" in auth)
		return NextResponse.json({ error: auth.error }, { status: auth.status });

	const rateCheck = readLimiter(request);
	if (rateCheck) return rateCheck;

	try {
		const db = getDatabase();
		ensurePersonasTable(db);

		const workspaceId = auth.user.workspace_id ?? 1;

		const customRows = db
			.prepare(
				`SELECT * FROM personas WHERE workspace_id = ? ORDER BY created_at ASC`,
			)
			.all(workspaceId) as PersonaRow[];

		const customPersonas = customRows.map(mapRow);

		const builtins = BUILTIN_PERSONAS.map((p) => ({
			id: p.id,
			name: p.name,
			systemPrompt: p.system_prompt,
			temperature: p.temperature,
			topP: p.top_p,
			model: p.model,
			constraints: [...p.constraints],
			isBuiltin: true,
			createdAt: 0,
			updatedAt: 0,
		}));

		return NextResponse.json({
			personas: [...builtins, ...customPersonas],
			total: builtins.length + customPersonas.length,
		});
	} catch (error) {
		logger.error({ err: error }, "GET /api/personas error");
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// ---------------------------------------------------------------------------
// POST /api/personas — create custom persona
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
	const auth = requireRole(request, "operator");
	if ("error" in auth)
		return NextResponse.json({ error: auth.error }, { status: auth.status });

	const rateCheck = mutationLimiter(request);
	if (rateCheck) return rateCheck;

	try {
		const body = await request.json();
		const { id, name, systemPrompt, temperature, topP, model, constraints } =
			body as {
				id?: string;
				name: string;
				systemPrompt: string;
				temperature: number;
				topP: number;
				model: string;
				constraints: string[];
			};

		if (!name || typeof name !== "string" || name.trim() === "") {
			return NextResponse.json(
				{ error: "Missing required field: name" },
				{ status: 400 },
			);
		}
		if (!systemPrompt || typeof systemPrompt !== "string") {
			return NextResponse.json(
				{ error: "Missing required field: systemPrompt" },
				{ status: 400 },
			);
		}

		const workspaceId = auth.user.workspace_id ?? 1;
		const personaId =
			id?.trim() ||
			`custom_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now()}`;

		// Reject if it conflicts with a built-in id
		if (BUILTIN_PERSONAS.some((p) => p.id === personaId)) {
			return NextResponse.json(
				{ error: "Cannot use a built-in persona ID" },
				{ status: 400 },
			);
		}

		const db = getDatabase();
		ensurePersonasTable(db);

		db.prepare(`
      INSERT INTO personas (id, name, system_prompt, temperature, top_p, model, constraints, is_builtin, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
			personaId,
			name.trim(),
			systemPrompt.trim(),
			typeof temperature === "number" ? temperature : 0.7,
			typeof topP === "number" ? topP : 0.95,
			model || "claude-sonnet-4-6",
			JSON.stringify(Array.isArray(constraints) ? constraints : []),
			workspaceId,
		);

		const row = db
			.prepare(`SELECT * FROM personas WHERE id = ? AND workspace_id = ?`)
			.get(personaId, workspaceId) as PersonaRow;

		return NextResponse.json({ persona: mapRow(row) }, { status: 201 });
	} catch (error) {
		logger.error({ err: error }, "POST /api/personas error");
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// ---------------------------------------------------------------------------
// PUT /api/personas — update custom persona
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
	const auth = requireRole(request, "operator");
	if ("error" in auth)
		return NextResponse.json({ error: auth.error }, { status: auth.status });

	const rateCheck = mutationLimiter(request);
	if (rateCheck) return rateCheck;

	try {
		const body = await request.json();
		const { id, name, systemPrompt, temperature, topP, model, constraints } =
			body as {
				id: string;
				name?: string;
				systemPrompt?: string;
				temperature?: number;
				topP?: number;
				model?: string;
				constraints?: string[];
			};

		if (!id) {
			return NextResponse.json(
				{ error: "Missing required field: id" },
				{ status: 400 },
			);
		}

		// Cannot update built-ins
		if (BUILTIN_PERSONAS.some((p) => p.id === id)) {
			return NextResponse.json(
				{ error: "Cannot modify built-in personas" },
				{ status: 400 },
			);
		}

		const workspaceId = auth.user.workspace_id ?? 1;
		const db = getDatabase();
		ensurePersonasTable(db);

		const existing = db
			.prepare(`SELECT * FROM personas WHERE id = ? AND workspace_id = ?`)
			.get(id, workspaceId) as PersonaRow | undefined;

		if (!existing) {
			return NextResponse.json({ error: "Persona not found" }, { status: 404 });
		}

		db.prepare(`
      UPDATE personas
      SET name = ?, system_prompt = ?, temperature = ?, top_p = ?, model = ?, constraints = ?, updated_at = unixepoch()
      WHERE id = ? AND workspace_id = ?
    `).run(
			name ?? existing.name,
			systemPrompt ?? existing.system_prompt,
			typeof temperature === "number" ? temperature : existing.temperature,
			typeof topP === "number" ? topP : existing.top_p,
			model ?? existing.model,
			JSON.stringify(Array.isArray(constraints) ? constraints : JSON.parse(existing.constraints)),
			id,
			workspaceId,
		);

		const updated = db
			.prepare(`SELECT * FROM personas WHERE id = ? AND workspace_id = ?`)
			.get(id, workspaceId) as PersonaRow;

		return NextResponse.json({ persona: mapRow(updated) });
	} catch (error) {
		logger.error({ err: error }, "PUT /api/personas error");
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// ---------------------------------------------------------------------------
// DELETE /api/personas — delete custom persona
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
	const auth = requireRole(request, "operator");
	if ("error" in auth)
		return NextResponse.json({ error: auth.error }, { status: auth.status });

	const rateCheck = mutationLimiter(request);
	if (rateCheck) return rateCheck;

	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Missing required query param: id" },
				{ status: 400 },
			);
		}

		// Cannot delete built-ins
		if (BUILTIN_PERSONAS.some((p) => p.id === id)) {
			return NextResponse.json(
				{ error: "Cannot delete built-in personas" },
				{ status: 400 },
			);
		}

		const workspaceId = auth.user.workspace_id ?? 1;
		const db = getDatabase();
		ensurePersonasTable(db);

		const result = db
			.prepare(`DELETE FROM personas WHERE id = ? AND workspace_id = ?`)
			.run(id, workspaceId);

		if (result.changes === 0) {
			return NextResponse.json({ error: "Persona not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, id });
	} catch (error) {
		logger.error({ err: error }, "DELETE /api/personas error");
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
