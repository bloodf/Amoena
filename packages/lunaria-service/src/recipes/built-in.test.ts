import { describe, it, expect } from "vitest";
import {
  BUILT_IN_RECIPES,
  getRecipe,
  listRecipes,
  type AgentRecipe,
} from "./built-in.js";

// ---------------------------------------------------------------------------
// Required field keys used for structural assertions
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: ReadonlyArray<keyof AgentRecipe> = [
  "id",
  "name",
  "description",
  "icon",
  "category",
  "defaultModel",
  "systemPrompt",
  "suggestedTools",
  "estimatedCostRange",
  "estimatedDuration",
];

const EXPECTED_IDS = [
  "pr-review",
  "bug-fix",
  "feature-impl",
  "refactor",
  "test-coverage",
  "documentation",
] as const;

// ---------------------------------------------------------------------------
// Catalogue completeness
// ---------------------------------------------------------------------------

describe("BUILT_IN_RECIPES", () => {
  it("contains exactly 6 recipes", () => {
    expect(BUILT_IN_RECIPES).toHaveLength(6);
  });

  it.each(EXPECTED_IDS)("includes the '%s' recipe", (id) => {
    const found = BUILT_IN_RECIPES.some((r) => r.id === id);
    expect(found).toBe(true);
  });

  it.each(EXPECTED_IDS)("recipe '%s' has all required fields non-empty", (id) => {
    const recipe = BUILT_IN_RECIPES.find((r) => r.id === id)!;
    for (const field of REQUIRED_FIELDS) {
      const value = recipe[field];
      if (typeof value === "string") {
        expect(value.length, `field "${field}" should not be empty`).toBeGreaterThan(0);
      } else {
        expect(value, `field "${field}" should be defined`).toBeDefined();
      }
    }
  });

  it("every recipe estimatedCostRange has min <= max", () => {
    for (const recipe of BUILT_IN_RECIPES) {
      expect(recipe.estimatedCostRange.min).toBeLessThanOrEqual(
        recipe.estimatedCostRange.max,
      );
    }
  });

  it("every recipe category is one of the allowed values", () => {
    const allowed = new Set(["development", "review", "maintenance"]);
    for (const recipe of BUILT_IN_RECIPES) {
      expect(allowed.has(recipe.category)).toBe(true);
    }
  });

  it("every recipe has at least one suggested tool", () => {
    for (const recipe of BUILT_IN_RECIPES) {
      expect(recipe.suggestedTools.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getRecipe
// ---------------------------------------------------------------------------

describe("getRecipe", () => {
  it("returns the correct recipe when given a valid id", () => {
    const recipe = getRecipe("pr-review");
    expect(recipe).toBeDefined();
    expect(recipe!.id).toBe("pr-review");
    expect(recipe!.name).toBe("PR Review");
  });

  it("returns undefined for an unknown id", () => {
    expect(getRecipe("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an empty string id", () => {
    expect(getRecipe("")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// listRecipes
// ---------------------------------------------------------------------------

describe("listRecipes", () => {
  it("returns all recipes when called without a category argument", () => {
    expect(listRecipes()).toHaveLength(BUILT_IN_RECIPES.length);
  });

  it("returns only development recipes when category is 'development'", () => {
    const results = listRecipes("development");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe("development");
    }
  });

  it("returns only review recipes when category is 'review'", () => {
    const results = listRecipes("review");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe("review");
    }
  });

  it("returns only maintenance recipes when category is 'maintenance'", () => {
    const results = listRecipes("maintenance");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe("maintenance");
    }
  });

  it("development + review + maintenance counts sum to total recipe count", () => {
    const total =
      listRecipes("development").length +
      listRecipes("review").length +
      listRecipes("maintenance").length;
    expect(total).toBe(BUILT_IN_RECIPES.length);
  });
});
