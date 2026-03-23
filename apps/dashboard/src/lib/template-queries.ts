import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";
import { type TaskHint, type TemplateOptions, BUILT_IN_TEMPLATES } from "./templates-data";

export type { TaskHint, TemplateOptions };

export interface GoalTemplateRow {
	id: string;
	name: string;
	description: string;
	goal_text: string;
	category: "built-in" | "custom";
	tags: string;        // JSON string
	task_hints: string;  // JSON string
	options: string;     // JSON string
	use_count: number;
	last_used_at: number | null;
	created_at: number;
	updated_at: number;
}

export interface ParsedTemplate {
	id: string;
	name: string;
	description: string;
	goalText: string;
	category: "built-in" | "custom";
	tags: string[];
	taskHints: TaskHint[];
	options: TemplateOptions;
	useCount: number;
	lastUsedAt: number | null;
	createdAt: number;
}

function parseRow(row: GoalTemplateRow): ParsedTemplate {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		goalText: row.goal_text,
		category: row.category,
		tags: JSON.parse(row.tags) as string[],
		taskHints: JSON.parse(row.task_hints) as TaskHint[],
		options: JSON.parse(row.options) as TemplateOptions,
		useCount: row.use_count,
		lastUsedAt: row.last_used_at,
		createdAt: row.created_at,
	};
}

/** Seed built-in templates (idempotent — skips if already exist) */
export function seedBuiltInTemplates(db: Database.Database): void {
	const insert = db.prepare(`
    INSERT OR IGNORE INTO goal_templates
      (id, name, description, goal_text, category, tags, task_hints, options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
	db.transaction(() => {
		for (const t of BUILT_IN_TEMPLATES) {
			insert.run(
				t.id,
				t.name,
				t.description,
				t.goalText,
				t.category,
				JSON.stringify(t.tags),
				JSON.stringify(t.taskHints),
				JSON.stringify(t.options),
			);
		}
	})();
}

/** List all templates (built-in first, then custom by use_count desc) */
export function listTemplates(
	db: Database.Database,
	options?: { category?: "built-in" | "custom"; tag?: string },
): ParsedTemplate[] {
	let sql =
		"SELECT * FROM goal_templates WHERE 1=1";
	const params: (string | number)[] = [];

	if (options?.category) {
		sql += " AND category = ?";
		params.push(options.category);
	}

	if (options?.tag) {
		sql += " AND tags LIKE ?";
		params.push(`%${options.tag}%`);
	}

	sql += " ORDER BY CASE category WHEN 'built-in' THEN 0 ELSE 1 END ASC, use_count DESC";

	const rows = db.prepare(sql).all(...params) as GoalTemplateRow[];
	return rows.map(parseRow);
}

/** Get a single template by ID */
export function getTemplate(
	db: Database.Database,
	templateId: string,
): ParsedTemplate | null {
	const row = db
		.prepare("SELECT * FROM goal_templates WHERE id = ?")
		.get(templateId) as GoalTemplateRow | undefined;
	return row ? parseRow(row) : null;
}

/** Create a custom template */
export function createTemplate(
	db: Database.Database,
	template: Omit<ParsedTemplate, "id" | "useCount" | "lastUsedAt" | "createdAt">,
): string {
	const id = randomUUID();
	db.prepare(`
    INSERT INTO goal_templates (id, name, description, goal_text, category, tags, task_hints, options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
		id,
		template.name,
		template.description,
		template.goalText,
		"custom",
		JSON.stringify(template.tags),
		JSON.stringify(template.taskHints),
		JSON.stringify(template.options),
	);
	return id;
}

/** Update a custom template (cannot update built-in) */
export function updateTemplate(
	db: Database.Database,
	templateId: string,
	updates: Partial<
		Pick<ParsedTemplate, "name" | "description" | "goalText" | "tags" | "taskHints" | "options">
	>,
): void {
	const existing = db
		.prepare("SELECT category FROM goal_templates WHERE id = ?")
		.get(templateId) as { category: string } | undefined;

	if (!existing) throw new Error(`Template not found: ${templateId}`);
	if (existing.category === "built-in") throw new Error("Cannot update built-in templates");

	const fields: string[] = [];
	const params: (string | number)[] = [];

	if (updates.name !== undefined) {
		fields.push("name = ?");
		params.push(updates.name);
	}
	if (updates.description !== undefined) {
		fields.push("description = ?");
		params.push(updates.description);
	}
	if (updates.goalText !== undefined) {
		fields.push("goal_text = ?");
		params.push(updates.goalText);
	}
	if (updates.tags !== undefined) {
		fields.push("tags = ?");
		params.push(JSON.stringify(updates.tags));
	}
	if (updates.taskHints !== undefined) {
		fields.push("task_hints = ?");
		params.push(JSON.stringify(updates.taskHints));
	}
	if (updates.options !== undefined) {
		fields.push("options = ?");
		params.push(JSON.stringify(updates.options));
	}

	if (fields.length === 0) return;

	fields.push("updated_at = unixepoch()");
	params.push(templateId);

	db.prepare(`UPDATE goal_templates SET ${fields.join(", ")} WHERE id = ?`).run(...params);
}

/** Delete a custom template (cannot delete built-in) */
export function deleteTemplate(db: Database.Database, templateId: string): void {
	const existing = db
		.prepare("SELECT category FROM goal_templates WHERE id = ?")
		.get(templateId) as { category: string } | undefined;

	if (!existing) throw new Error(`Template not found: ${templateId}`);
	if (existing.category === "built-in") throw new Error("Cannot delete built-in templates");

	db.prepare("DELETE FROM goal_templates WHERE id = ?").run(templateId);
}

/** Increment use_count and set last_used_at */
export function recordTemplateUse(db: Database.Database, templateId: string): void {
	db.prepare(`
    UPDATE goal_templates
    SET use_count = use_count + 1, last_used_at = unixepoch(), updated_at = unixepoch()
    WHERE id = ?
  `).run(templateId);
}

/** Extract placeholder variables from a goal text */
export function extractPlaceholders(goalText: string): string[] {
	const matches = goalText.match(/\{([^}]+)\}/g);
	if (!matches) return [];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const match of matches) {
		const name = match.slice(1, -1);
		if (!seen.has(name)) {
			seen.add(name);
			result.push(name);
		}
	}
	return result;
}
