#!/usr/bin/env bun
/**
 * export-agents.ts — Multi-format agent persona export pipeline
 *
 * Reads Amoena agent persona definitions from apps/desktop/resources/agent-personas/
 * and exports them to formats consumable by other AI coding tools.
 *
 * Inspired by agency-agents' convert.sh conversion pipeline.
 *
 * Usage:
 *   bun run scripts/export-agents.ts --format claude-code --output dist/agents/
 *   bun run scripts/export-agents.ts --format all --output dist/agents/
 *
 * Supported formats:
 *   claude-code  — .claude/agents/ Markdown with YAML frontmatter
 *   cursor       — .cursorrules agent definition
 *   aider        — .aider.agent.md convention
 *   windsurf     — .windsurfrules format
 *   gemini-cli   — AGENTS.md-compatible persona
 *   opencode     — opencode.json agent entries
 *   all          — Export to all formats
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename, relative } from "node:path";
import { parseArgs } from "node:util";

// --- Types ---

interface AgentFrontmatter {
  name: string;
  description: string;
  division: string;
  color?: string;
  emoji?: string;
  vibe?: string;
  collaborationStyle?: string;
  communicationPreference?: string;
  decisionWeight?: number;
  tools?: string[];
  permissions?: string;
}

interface AgentPersona {
  frontmatter: AgentFrontmatter;
  body: string;
  filePath: string;
}

type ExportFormat =
  | "claude-code"
  | "cursor"
  | "aider"
  | "windsurf"
  | "gemini-cli"
  | "opencode"
  | "all";

const REQUIRED_FIELDS: Array<keyof AgentFrontmatter> = [
  "name",
  "description",
  "division",
  "color",
  "emoji",
  "vibe",
  "collaborationStyle",
  "communicationPreference",
  "decisionWeight",
  "tools",
  "permissions",
];

// --- YAML Frontmatter Parser (minimal, no dependency) ---

function parseFrontmatter(content: string): {
  frontmatter: AgentFrontmatter;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("No YAML frontmatter found");
  }

  const yamlStr = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlStr.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1);
    }

    // Parse arrays
    if (typeof value === "string" && value.startsWith("[")) {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if parse fails
      }
    }

    // Parse numbers
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      value = Number(value);
    }

    frontmatter[key] = value;
  }

  return { frontmatter: frontmatter as unknown as AgentFrontmatter, body };
}

// --- File Discovery ---

async function discoverPersonas(baseDir: string): Promise<AgentPersona[]> {
  const personas: AgentPersona[] = [];
  const divisions = await readdir(baseDir, { withFileTypes: true });

  for (const div of divisions) {
    if (!div.isDirectory()) continue;
    const divPath = join(baseDir, div.name);
    const files = await readdir(divPath);

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const filePath = join(divPath, file);
      const content = await readFile(filePath, "utf-8");

      try {
        const { frontmatter, body } = parseFrontmatter(content);
        personas.push({ frontmatter, body, filePath });
      } catch (err) {
        console.warn(`Skipping ${filePath}: ${(err as Error).message}`);
      }
    }
  }

  return personas;
}

function validatePersonas(personas: AgentPersona[]) {
  const errors: string[] = [];

  for (const persona of personas) {
    for (const field of REQUIRED_FIELDS) {
      const value = persona.frontmatter[field];
      const missing =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);

      if (missing) {
        errors.push(`${persona.filePath}: missing required field '${field}'`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Persona validation failed:\n${errors.join("\n")}`);
  }
}

// --- Export Formatters ---

function toClaudeCode(persona: AgentPersona): string {
  const { frontmatter: fm, body } = persona;
  const toolsLine = fm.tools?.length
    ? `tools: ${JSON.stringify(fm.tools)}`
    : "";

  return `---
name: "${fm.name}"
description: "${fm.description}"
${toolsLine}
---

${body}
`;
}

function toCursor(persona: AgentPersona): string {
  const { frontmatter: fm, body } = persona;
  return `# ${fm.name}

${fm.description}

${body}
`;
}

function toAider(persona: AgentPersona): string {
  const { frontmatter: fm, body } = persona;
  return `# ${fm.name} — ${fm.description}

${body}

## Configuration
- Division: ${fm.division}
- Collaboration Style: ${fm.collaborationStyle ?? "cooperative"}
- Communication: ${fm.communicationPreference ?? "concise"}
`;
}

function toWindsurf(persona: AgentPersona): string {
  const { frontmatter: fm, body } = persona;
  return `# ${fm.name}

> ${fm.description}

${body}
`;
}

function toGeminiCli(persona: AgentPersona): string {
  const { frontmatter: fm, body } = persona;
  return `# ${fm.name}

**Role:** ${fm.description}
**Division:** ${fm.division}
**Style:** ${fm.collaborationStyle ?? "cooperative"}, ${fm.communicationPreference ?? "concise"}

${body}
`;
}

interface OpenCodeAgent {
  name: string;
  description: string;
  model?: string;
  system_prompt: string;
  tools?: string[];
}

function toOpenCodeEntry(persona: AgentPersona): OpenCodeAgent {
  const { frontmatter: fm, body } = persona;
  return {
    name: fm.name.toLowerCase().replace(/\s+/g, "-"),
    description: fm.description,
    system_prompt: body,
    tools: fm.tools,
  };
}

// --- Export Orchestrator ---

async function exportFormat(
  personas: AgentPersona[],
  format: Exclude<ExportFormat, "all">,
  outputDir: string,
): Promise<void> {
  const formatDir = join(outputDir, format);
  await mkdir(formatDir, { recursive: true });

  if (format === "opencode") {
    // OpenCode exports as a single JSON file
    const agents: Record<string, OpenCodeAgent> = {};
    for (const p of personas) {
      const entry = toOpenCodeEntry(p);
      agents[entry.name] = entry;
    }
    const outPath = join(formatDir, "agents.json");
    await writeFile(outPath, JSON.stringify({ agents }, null, 2));
    console.log(`  ${format}: ${outPath} (${personas.length} agents)`);
    return;
  }

  const formatters: Record<
    string,
    (p: AgentPersona) => string
  > = {
    "claude-code": toClaudeCode,
    cursor: toCursor,
    aider: toAider,
    windsurf: toWindsurf,
    "gemini-cli": toGeminiCli,
  };

  const formatter = formatters[format];
  if (!formatter) throw new Error(`Unknown format: ${format}`);

  let count = 0;
  for (const persona of personas) {
    const slug = persona.frontmatter.name
      .toLowerCase()
      .replace(/\s+/g, "-");
    const ext = format === "cursor" ? ".cursorrules" : ".md";
    const outPath = join(formatDir, `${slug}${ext}`);
    await writeFile(outPath, formatter(persona));
    count++;
  }

  console.log(`  ${format}: ${count} files in ${formatDir}`);
}

// --- Main ---

async function main() {
  const { values } = parseArgs({
    options: {
      format: { type: "string", short: "f", default: "all" },
      output: { type: "string", short: "o", default: "dist/agents" },
      input: {
        type: "string",
        short: "i",
        default: "apps/desktop/resources/agent-personas",
      },
      "validate-only": { type: "boolean", default: false },
    },
  });

  const format = (values.format ?? "all") as ExportFormat;
  const outputDir = values.output ?? "dist/agents";
  const inputDir = values.input ?? "apps/desktop/resources/agent-personas";
  const validateOnly = values["validate-only"] ?? false;

  console.log(`Discovering agent personas in ${inputDir}...`);
  const personas = await discoverPersonas(inputDir);
  console.log(`Found ${personas.length} agent personas.\n`);

  if (personas.length === 0) {
    console.error(
      "No personas found. Check that the input directory contains division subdirectories with .md files.",
    );
    process.exit(1);
  }

  validatePersonas(personas);

  if (validateOnly) {
    console.log("Persona validation passed.");
    return;
  }

  const formats: Exclude<ExportFormat, "all">[] =
    format === "all"
      ? ["claude-code", "cursor", "aider", "windsurf", "gemini-cli", "opencode"]
      : [format as Exclude<ExportFormat, "all">];

  console.log(`Exporting to: ${formats.join(", ")}\n`);

  for (const fmt of formats) {
    await exportFormat(personas, fmt, outputDir);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
