import { File as FileIcon, Folder as FolderIcon, Users } from "lucide-react";

import { composerBuiltinCommands, composerFiles, composerSkills } from "./config";
import type { PaletteGroup, PaletteItem } from "./types";

export function buildComposerPaletteItems({
  filter,
  agents,
  activeAgentId,
}: {
  filter: string;
  agents: { id: string; name: string; role: string }[];
  activeAgentId: string;
}): PaletteItem[] {
  const query = filter.toLowerCase();
  const items: PaletteItem[] = [];

  composerBuiltinCommands.forEach((command) => {
    if (!query || command.name.includes(query) || command.desc.toLowerCase().includes(query)) {
      items.push({
        category: "commands",
        id: `cmd-${command.name}`,
        name: `/${command.name}`,
        desc: command.desc,
        Icon: command.Icon,
        source: "builtin",
      });
    }
  });

  composerSkills.forEach((skill) => {
    const kebabName = skill.name.toLowerCase().replace(/\s+/g, "-");
    if (!query || kebabName.includes(query) || skill.name.toLowerCase().includes(query) || skill.desc.toLowerCase().includes(query)) {
      items.push({
        category: "skills",
        id: `skill-${kebabName}`,
        name: `/${kebabName}`,
        desc: skill.desc,
        Icon: skill.Icon,
        source: skill.source === "project" ? "project" : "builtin",
      });
    }
  });

  agents.forEach((agent) => {
    if (!query || agent.name.toLowerCase().includes(query) || agent.role.toLowerCase().includes(query)) {
      items.push({
        category: "agents",
        id: `agent-${agent.id}`,
        name: agent.name,
        desc: agent.role,
        Icon: Users,
        meta: agent.id === activeAgentId ? "active" : undefined,
      });
    }
  });

  composerFiles.forEach((file) => {
    if (!query || file.path.toLowerCase().includes(query) || file.name.toLowerCase().includes(query)) {
      items.push({
        category: "files",
        id: `file-${file.path}`,
        name: file.path,
        desc: file.type,
        Icon: file.type === "file" ? FileIcon : FolderIcon,
      });
    }
  });

  return items;
}

export function buildComposerPaletteGroups(items: PaletteItem[]): PaletteGroup[] {
  const groups: PaletteGroup[] = [];
  [
    { category: "commands" as const, label: "Commands" },
    { category: "skills" as const, label: "Skills" },
    { category: "agents" as const, label: "Agents" },
    { category: "files" as const, label: "Files" },
  ].forEach(({ category, label }) => {
    const categoryItems = items.filter((item) => item.category === category);
    if (categoryItems.length > 0) groups.push({ category, label, items: categoryItems });
  });
  return groups;
}

export function getNextComposerAgentId(currentId: string, agents: { id: string }[]) {
  const currentIndex = agents.findIndex((agent) => agent.id === currentId);
  return agents[(currentIndex + 1) % agents.length]?.id ?? currentId;
}
