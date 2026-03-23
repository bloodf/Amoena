import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	createTemplate,
	deleteTemplate,
	extractPlaceholders,
	getTemplate,
	listTemplates,
	recordTemplateUse,
	seedBuiltInTemplates,
	updateTemplate,
} from "../template-queries";

function createTestDb(): Database.Database {
	const db = new Database(":memory:");
	db.exec(`
    CREATE TABLE IF NOT EXISTS goal_templates (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL,
      goal_text   TEXT    NOT NULL,
      category    TEXT    NOT NULL DEFAULT 'custom',
      tags        TEXT    NOT NULL DEFAULT '[]',
      task_hints  TEXT    NOT NULL DEFAULT '[]',
      options     TEXT    NOT NULL DEFAULT '{}',
      use_count   INTEGER NOT NULL DEFAULT 0,
      last_used_at INTEGER,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
	return db;
}

describe("seedBuiltInTemplates", () => {
	let db: Database.Database;
	beforeEach(() => { db = createTestDb(); });
	afterEach(() => { db.close(); });

	it("creates 5 built-in templates", () => {
		seedBuiltInTemplates(db);
		const templates = listTemplates(db, { category: "built-in" });
		expect(templates).toHaveLength(5);
	});

	it("idempotent — second call doesn't duplicate", () => {
		seedBuiltInTemplates(db);
		seedBuiltInTemplates(db);
		const templates = listTemplates(db, { category: "built-in" });
		expect(templates).toHaveLength(5);
	});
});

describe("listTemplates", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = createTestDb();
		seedBuiltInTemplates(db);
	});
	afterEach(() => { db.close(); });

	it("returns built-in templates first", () => {
		createTemplate(db, {
			name: "My Custom",
			description: "Custom template",
			goalText: "Do {something}",
			category: "custom",
			tags: ["custom"],
			taskHints: [],
			options: {},
		});
		const templates = listTemplates(db);
		const firstCategory = templates[0].category;
		expect(firstCategory).toBe("built-in");
	});

	it("filters by category", () => {
		createTemplate(db, {
			name: "Custom One",
			description: "desc",
			goalText: "Goal {x}",
			category: "custom",
			tags: [],
			taskHints: [],
			options: {},
		});
		const builtIn = listTemplates(db, { category: "built-in" });
		const custom = listTemplates(db, { category: "custom" });
		expect(builtIn.every((t) => t.category === "built-in")).toBe(true);
		expect(custom.every((t) => t.category === "custom")).toBe(true);
		expect(custom).toHaveLength(1);
	});

	it("filters by tag", () => {
		const results = listTemplates(db, { tag: "bug" });
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((t) => t.tags.includes("bug"))).toBe(true);
	});
});

describe("createTemplate / updateTemplate / deleteTemplate", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = createTestDb();
		seedBuiltInTemplates(db);
	});
	afterEach(() => { db.close(); });

	it("create returns a valid ID", () => {
		const id = createTemplate(db, {
			name: "Test Template",
			description: "A test",
			goalText: "Do {task}",
			category: "custom",
			tags: ["test"],
			taskHints: [],
			options: { maxConcurrency: 1 },
		});
		expect(id).toBeTruthy();
		const fetched = getTemplate(db, id);
		expect(fetched).not.toBeNull();
		expect(fetched?.name).toBe("Test Template");
	});

	it("update modifies fields", () => {
		const id = createTemplate(db, {
			name: "Original",
			description: "Original desc",
			goalText: "Original {goal}",
			category: "custom",
			tags: [],
			taskHints: [],
			options: {},
		});
		updateTemplate(db, id, { name: "Updated Name" });
		const fetched = getTemplate(db, id);
		expect(fetched?.name).toBe("Updated Name");
	});

	it("update built-in throws error", () => {
		expect(() =>
			updateTemplate(db, "builtin-add-feature", { name: "Hacked" }),
		).toThrow("Cannot update built-in templates");
	});

	it("delete removes custom template", () => {
		const id = createTemplate(db, {
			name: "To Delete",
			description: "Will be deleted",
			goalText: "Delete {me}",
			category: "custom",
			tags: [],
			taskHints: [],
			options: {},
		});
		deleteTemplate(db, id);
		expect(getTemplate(db, id)).toBeNull();
	});

	it("delete built-in throws error", () => {
		expect(() => deleteTemplate(db, "builtin-add-feature")).toThrow(
			"Cannot delete built-in templates",
		);
	});
});

describe("recordTemplateUse", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = createTestDb();
		seedBuiltInTemplates(db);
	});
	afterEach(() => { db.close(); });

	it("increments use_count", () => {
		const before = getTemplate(db, "builtin-add-feature");
		expect(before?.useCount).toBe(0);
		recordTemplateUse(db, "builtin-add-feature");
		const after = getTemplate(db, "builtin-add-feature");
		expect(after?.useCount).toBe(1);
	});

	it("sets last_used_at", () => {
		const before = getTemplate(db, "builtin-add-feature");
		expect(before?.lastUsedAt).toBeNull();
		recordTemplateUse(db, "builtin-add-feature");
		const after = getTemplate(db, "builtin-add-feature");
		expect(after?.lastUsedAt).not.toBeNull();
	});
});

describe("extractPlaceholders", () => {
	it("extracts variables from curly braces", () => {
		expect(extractPlaceholders("Implement {feature_name}: {feature_description}")).toEqual([
			"feature_name",
			"feature_description",
		]);
	});

	it("returns empty array when no placeholders", () => {
		expect(extractPlaceholders("No placeholders here")).toEqual([]);
	});

	it("handles duplicate placeholders (deduplicates)", () => {
		expect(extractPlaceholders("Fix {bug} in {module} and {bug} again")).toEqual([
			"bug",
			"module",
		]);
	});
});
