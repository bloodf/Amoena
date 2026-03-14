#!/usr/bin/env bun

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type PersonaFrontmatter = {
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
  permissions?: string | string[];
};

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("No YAML frontmatter found");
  }

  const frontmatter: Record<string, unknown> = {};
  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value: unknown = line.slice(separator + 1).trim();

    if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (typeof value === "string" && value.startsWith("[")) {
      try {
        value = JSON.parse(value);
      } catch {
        // keep original string
      }
    }

    if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) {
      value = Number(value);
    }

    frontmatter[key] = value;
  }

  return frontmatter as PersonaFrontmatter;
}

async function main() {
  const repoRoot = process.cwd();
  const personasRoot = join(repoRoot, "apps", "desktop", "resources", "agent-personas");
  const outputPath = join(repoRoot, "docs", "reference", "built-in-agents.md");

  const divisions = await readdir(personasRoot, { withFileTypes: true });
  const personas: PersonaFrontmatter[] = [];

  for (const division of divisions) {
    if (!division.isDirectory()) continue;
    const divisionPath = join(personasRoot, division.name);
    const files = await readdir(divisionPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".md")) continue;
      const content = await readFile(join(divisionPath, file.name), "utf8");
      personas.push(parseFrontmatter(content));
    }
  }

  personas.sort((left, right) => left.name.localeCompare(right.name));

  const lines = [
    "# Built-in Agents",
    "",
    "This page is generated from `apps/desktop/resources/agent-personas/` during the docs build.",
    "",
    `Generated agents: ${personas.length}`,
    "",
  ];

  for (const persona of personas) {
    const permissions = Array.isArray(persona.permissions)
      ? persona.permissions.join(", ")
      : persona.permissions ?? "standard";
    const tools = persona.tools?.length ? persona.tools.join(", ") : "None";
    const decisionWeight =
      typeof persona.decisionWeight === "number"
        ? `${Math.round(persona.decisionWeight * 100)}%`
        : "n/a";

    lines.push(`## ${persona.emoji ?? "•"} ${persona.name}`);
    lines.push("");
    lines.push(`- Description: ${persona.description}`);
    lines.push(`- Division: ${persona.division}`);
    lines.push(`- Vibe: ${persona.vibe ?? "n/a"}`);
    lines.push(`- Collaboration style: ${persona.collaborationStyle ?? "n/a"}`);
    lines.push(`- Communication preference: ${persona.communicationPreference ?? "n/a"}`);
    lines.push(`- Decision weight: ${decisionWeight}`);
    lines.push(`- Tools: ${tools}`);
    lines.push(`- Permissions: ${permissions}`);
    lines.push("");
  }

  await mkdir(join(repoRoot, "docs", "reference"), { recursive: true });
  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Generated ${outputPath}`);
}

await main();
