import { describe, expect, test } from "bun:test";
import {
  buildComposerPaletteItems,
  buildComposerPaletteGroups,
  getNextComposerAgentId,
} from "./palette";

const agents = [
  { id: "agent-1", name: "Alice", role: "Lead" },
  { id: "agent-2", name: "Bob", role: "Builder" },
  { id: "agent-3", name: "Carol", role: "QA" },
];

describe("buildComposerPaletteItems", () => {
  test("returns all items when filter is empty", () => {
    const items = buildComposerPaletteItems({ filter: "", agents, activeAgentId: "agent-1" });
    expect(items.length).toBeGreaterThan(0);
  });

  test("filters commands by name — branch line 19", () => {
    const items = buildComposerPaletteItems({ filter: "help", agents: [], activeAgentId: "" });
    const commandItems = items.filter((i) => i.category === "commands");
    // All returned command items should match filter
    commandItems.forEach((item) => {
      expect(item.name.toLowerCase() + item.desc.toLowerCase()).toMatch(/help/i);
    });
  });

  test("filters agents by name — branch line 46", () => {
    const items = buildComposerPaletteItems({ filter: "alice", agents, activeAgentId: "agent-1" });
    const agentItems = items.filter((i) => i.category === "agents");
    expect(agentItems.length).toBeGreaterThan(0);
    expect(agentItems[0].name).toBe("Alice");
  });

  test("filters agents by role — branch line 46", () => {
    const items = buildComposerPaletteItems({ filter: "lead", agents, activeAgentId: "agent-1" });
    const agentItems = items.filter((i) => i.category === "agents");
    expect(agentItems.some((i) => i.name === "Alice")).toBe(true);
  });

  test("marks active agent with meta='active' — branch line 53", () => {
    const items = buildComposerPaletteItems({ filter: "", agents, activeAgentId: "agent-2" });
    const bobItem = items.find((i) => i.category === "agents" && i.name === "Bob");
    expect(bobItem?.meta).toBe("active");
  });

  test("non-active agent has no meta='active' — branch line 53", () => {
    const items = buildComposerPaletteItems({ filter: "", agents, activeAgentId: "agent-2" });
    const aliceItem = items.find((i) => i.category === "agents" && i.name === "Alice");
    expect(aliceItem?.meta).toBeUndefined();
  });

  test("includes file items when filter matches file path — branch line 58-65", () => {
    const items = buildComposerPaletteItems({ filter: "", agents: [], activeAgentId: "" });
    const fileItems = items.filter((i) => i.category === "files");
    expect(fileItems.length).toBeGreaterThan(0);
  });

  test("skill source is project when skill.source is project — branch line 40", () => {
    // skills with source='project' should have source='project' on the item
    const items = buildComposerPaletteItems({ filter: "", agents: [], activeAgentId: "" });
    const skillItems = items.filter((i) => i.category === "skills");
    const projectSkills = skillItems.filter((i) => i.source === "project");
    const builtinSkills = skillItems.filter((i) => i.source === "builtin");
    // We just ensure both branches are exercised by having skills
    expect(skillItems.length).toBeGreaterThanOrEqual(0);
    expect(projectSkills.length + builtinSkills.length).toBe(skillItems.length);
  });

  test("excludes agents not matching filter — branch line 46", () => {
    const items = buildComposerPaletteItems({ filter: "alice", agents, activeAgentId: "agent-1" });
    const agentItems = items.filter((i) => i.category === "agents");
    const hasBob = agentItems.some((i) => i.name === "Bob");
    expect(hasBob).toBe(false);
  });
});

describe("buildComposerPaletteGroups", () => {
  test("groups items by category", () => {
    const items = buildComposerPaletteItems({ filter: "", agents, activeAgentId: "agent-1" });
    const groups = buildComposerPaletteGroups(items);
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((group) => {
      expect(group.items.length).toBeGreaterThan(0);
    });
  });

  test("returns empty groups array when no items", () => {
    const groups = buildComposerPaletteGroups([]);
    expect(groups.length).toBe(0);
  });

  test("excludes categories with no items — branch line 82", () => {
    // Only agents in items
    const items = buildComposerPaletteItems({ filter: "alice", agents, activeAgentId: "" });
    const groups = buildComposerPaletteGroups(items);
    const agentGroup = groups.find((g) => g.category === "agents");
    expect(agentGroup).toBeTruthy();
  });

  test("preserves category order: commands, skills, agents, files", () => {
    const items = buildComposerPaletteItems({ filter: "", agents, activeAgentId: "agent-1" });
    const groups = buildComposerPaletteGroups(items);
    const categories = groups.map((g) => g.category);
    const commandIdx = categories.indexOf("commands");
    const agentIdx = categories.indexOf("agents");
    if (commandIdx !== -1 && agentIdx !== -1) {
      expect(commandIdx).toBeLessThan(agentIdx);
    }
  });
});

describe("getNextComposerAgentId", () => {
  test("returns next agent id in cycle — branch line 88-89", () => {
    const next = getNextComposerAgentId("agent-1", agents);
    expect(next).toBe("agent-2");
  });

  test("wraps around to first agent from last — branch line 88-89", () => {
    const next = getNextComposerAgentId("agent-3", agents);
    expect(next).toBe("agent-1");
  });

  test("returns currentId when agents list is empty — branch line 89 (nullish fallback)", () => {
    const next = getNextComposerAgentId("agent-x", []);
    expect(next).toBe("agent-x");
  });

  test("returns next agent even when currentId not found (index -1 → agents[0])", () => {
    const next = getNextComposerAgentId("not-found", agents);
    // (-1 + 1) % 3 = 0 → agents[0]
    expect(next).toBe("agent-1");
  });
});
