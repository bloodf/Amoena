import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { AgentDetailSheet } from "@/composites/agents/AgentDetailSheet";
import { AgentManagementHeader } from "@/composites/agents/AgentManagementHeader";
import { AgentManagementTabs } from "@/composites/agents/AgentManagementTabs";
import { AgentRow } from "@/composites/agents/AgentRow";
import { TeamCommunicationFlow } from "@/composites/agents/TeamCommunicationFlow";
import { TeamListPane } from "@/composites/agents/TeamListPane";
import { TeamStatsGrid } from "@/composites/agents/TeamStatsGrid";
import { TeamStatusTable } from "@/composites/agents/TeamStatusTable";

import { initialManagedAgents } from "@/composites/agents/data";
import type { AgentTeam, ManagedAgent } from "@/composites/agents/types";

/* ───────────────────────────────────────────────────────────
   Meta
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Agents",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────────────────────────────────────────────────────────
   Shared mock data
   ─────────────────────────────────────────────────────────── */

const mainAgent = initialManagedAgents[0]; // Claude 4 Sonnet – active, has children
const idleAgent = initialManagedAgents[1]; // Docs Generator – idle, no children
const failedAgent = initialManagedAgents[2]; // Security Auditor – failed

const errorAgent: ManagedAgent = {
  name: "Crash Recovery Bot",
  type: "Main",
  source: "imported",
  provider: "Anthropic",
  model: "claude-4-opus",
  status: "failed",
  lastActive: "12 min ago",
  role: "Recovery Agent",
  tools: ["terminal", "file_read", "git"],
  permission: "Full access",
  session: "Incident Response #42",
  mailbox: { count: 5, lastMessage: "OOM killed during compilation" },
  division: "engineering",
  color: "#0891B2",
  emoji: "\u{1F6A8}",
  vibe: "Crash whisperer, always on call",
  collaborationStyle: "directive",
  communicationPreference: "concise",
  decisionWeight: 0.95,
};

const activeTeam: AgentTeam = {
  id: "team-frontend",
  name: "Frontend Migration",
  description: "Migrate legacy jQuery dashboard to React + Tailwind",
  status: "active",
  totalTokens: "1.2M",
  startedAt: "14 min ago",
  completedTasks: 3,
  totalTasks: 8,
  agents: [
    {
      id: "a1",
      name: "Architect",
      role: "Lead Planner",
      model: "claude-4-sonnet",
      tuiColor: "text-primary",
      status: "working",
      currentTask: "Designing component tree",
      progress: 65,
      tokensUsed: "480K",
      messagesExchanged: 12,
    },
    {
      id: "a2",
      name: "Stylist",
      role: "CSS → Tailwind",
      model: "gpt-5.3-codex",
      tuiColor: "text-green",
      status: "waiting",
      currentTask: "Awaiting component specs",
      progress: 20,
      tokensUsed: "210K",
      messagesExchanged: 5,
    },
    {
      id: "a3",
      name: "Test Runner",
      role: "E2E & Unit Tests",
      model: "claude-4-haiku",
      tuiColor: "text-warning",
      status: "idle",
      tokensUsed: "85K",
      messagesExchanged: 3,
    },
  ],
};

const completedTeam: AgentTeam = {
  id: "team-api",
  name: "API Hardening",
  description: "Add rate limiting, input validation, and audit logging to all endpoints",
  status: "completed",
  totalTokens: "3.8M",
  startedAt: "2 hours ago",
  completedTasks: 12,
  totalTasks: 12,
  agents: [
    {
      id: "b1",
      name: "Validator",
      role: "Schema Enforcer",
      model: "claude-4-sonnet",
      tuiColor: "text-primary",
      status: "completed",
      progress: 100,
      tokensUsed: "1.4M",
      messagesExchanged: 34,
    },
    {
      id: "b2",
      name: "Rate Limiter",
      role: "Middleware Agent",
      model: "gpt-5.4",
      tuiColor: "text-green",
      status: "completed",
      progress: 100,
      tokensUsed: "920K",
      messagesExchanged: 18,
    },
    {
      id: "b3",
      name: "Auditor",
      role: "Logging & Compliance",
      model: "gemini-2.5-pro",
      tuiColor: "text-purple",
      status: "completed",
      progress: 100,
      tokensUsed: "1.5M",
      messagesExchanged: 27,
    },
  ],
};

const pausedTeam: AgentTeam = {
  id: "team-docs",
  name: "Documentation Sprint",
  description: "Generate API docs, architecture diagrams, and onboarding guides",
  status: "paused",
  totalTokens: "640K",
  startedAt: "45 min ago",
  completedTasks: 1,
  totalTasks: 6,
  agents: [
    {
      id: "c1",
      name: "Doc Writer",
      role: "Content Generator",
      model: "claude-4-sonnet",
      tuiColor: "text-primary",
      status: "idle",
      tokensUsed: "420K",
      messagesExchanged: 9,
    },
    {
      id: "c2",
      name: "Diagrammer",
      role: "Mermaid & SVG",
      model: "gpt-5.3-codex",
      tuiColor: "text-green",
      status: "waiting",
      currentTask: "Blocked on API schema export",
      tokensUsed: "220K",
      messagesExchanged: 4,
    },
  ],
};

const allTeams: AgentTeam[] = [activeTeam, completedTeam, pausedTeam];

/* ───────────────────────────────────────────────────────────
   AgentDetailSheet
   ─────────────────────────────────────────────────────────── */

const sheetCallbacks = {
  onClose: fn(),
  onStatusChange: fn(),
  onPermissionChange: fn(),
  onDelete: fn(),
};

export const AgentDetailSheetActive: Story = {
  name: "AgentDetailSheet / Active Agent",
  parameters: { layout: "fullscreen" },
  render: () => <AgentDetailSheet agent={mainAgent} {...sheetCallbacks} />,
};

export const AgentDetailSheetFailed: Story = {
  name: "AgentDetailSheet / Failed Agent",
  parameters: { layout: "fullscreen" },
  render: () => <AgentDetailSheet agent={failedAgent} {...sheetCallbacks} />,
};

export const AgentDetailSheetError: Story = {
  name: "AgentDetailSheet / Error State",
  parameters: { layout: "fullscreen" },
  render: () => <AgentDetailSheet agent={errorAgent} {...sheetCallbacks} />,
};

export const AgentDetailSheetIdle: Story = {
  name: "AgentDetailSheet / Idle Agent",
  parameters: { layout: "fullscreen" },
  render: () => <AgentDetailSheet agent={idleAgent} {...sheetCallbacks} />,
};

/* ───────────────────────────────────────────────────────────
   AgentManagementHeader
   ─────────────────────────────────────────────────────────── */

const headerCallbacks = {
  onFilterSourceChange: fn(),
  onFilterStatusChange: fn(),
  onFilterDivisionChange: fn(),
  onImportAgent: fn(),
  onAddAgent: fn(),
};

export const HeaderDefault: Story = {
  name: "AgentManagementHeader / Default",
  parameters: { layout: "fullscreen" },
  render: () => (
    <AgentManagementHeader filterSource="all" filterStatus="all" filterDivision="all" {...headerCallbacks} />
  ),
};

export const HeaderFiltered: Story = {
  name: "AgentManagementHeader / Filtered",
  parameters: { layout: "fullscreen" },
  render: () => (
    <AgentManagementHeader
      filterSource="built-in"
      filterStatus="active"
      filterDivision="all"
      {...headerCallbacks}
    />
  ),
};

export const HeaderMarketplace: Story = {
  name: "AgentManagementHeader / Marketplace Source",
  parameters: { layout: "fullscreen" },
  render: () => (
    <AgentManagementHeader
      filterSource="marketplace"
      filterStatus="all"
      filterDivision="all"
      {...headerCallbacks}
    />
  ),
};

/* ───────────────────────────────────────────────────────────
   AgentManagementTabs
   ─────────────────────────────────────────────────────────── */

export const TabsAgentsActive: Story = {
  name: "AgentManagementTabs / Agents Tab",
  render: () => <AgentManagementTabs activeTab="agents" onChange={fn()} />,
};

export const TabsTeamsActive: Story = {
  name: "AgentManagementTabs / Teams Tab",
  render: () => <AgentManagementTabs activeTab="teams" onChange={fn()} />,
};

/* ───────────────────────────────────────────────────────────
   AgentRow
   ─────────────────────────────────────────────────────────── */

const rowCallbacks = {
  onToggle: fn(),
  onOpenSettings: fn(),
};

export const RowActiveMainExpanded: Story = {
  name: "AgentRow / Active Main (Expanded)",
  render: () => (
    <div className="w-[800px] border border-border">
      <AgentRow agent={mainAgent} depth={0} expanded={true} {...rowCallbacks} />
    </div>
  ),
};

export const RowActiveMainCollapsed: Story = {
  name: "AgentRow / Active Main (Collapsed)",
  render: () => (
    <div className="w-[800px] border border-border">
      <AgentRow agent={mainAgent} depth={0} expanded={false} {...rowCallbacks} />
    </div>
  ),
};

export const RowSubAgent: Story = {
  name: "AgentRow / Sub-Agent (Nested)",
  render: () => (
    <div className="w-[800px] border border-border">
      <AgentRow
        agent={mainAgent.children![0]}
        depth={1}
        expanded={false}
        {...rowCallbacks}
      />
    </div>
  ),
};

export const RowFailedAgent: Story = {
  name: "AgentRow / Failed Agent",
  render: () => (
    <div className="w-[800px] border border-border">
      <AgentRow agent={failedAgent} depth={0} expanded={false} {...rowCallbacks} />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   TeamCommunicationFlow
   ─────────────────────────────────────────────────────────── */

export const CommFlowActive: Story = {
  name: "TeamCommunicationFlow / Active Team",
  render: () => (
    <div className="w-[600px]">
      <TeamCommunicationFlow team={activeTeam} />
    </div>
  ),
};

export const CommFlowCompleted: Story = {
  name: "TeamCommunicationFlow / Completed Team",
  render: () => (
    <div className="w-[600px]">
      <TeamCommunicationFlow team={completedTeam} />
    </div>
  ),
};

export const CommFlowPaused: Story = {
  name: "TeamCommunicationFlow / Paused Team",
  render: () => (
    <div className="w-[600px]">
      <TeamCommunicationFlow team={pausedTeam} />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   TeamListPane
   ─────────────────────────────────────────────────────────── */

export const TeamListDefault: Story = {
  name: "TeamListPane / Default Selection",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex h-[500px]">
      <TeamListPane
        teams={allTeams}
        selectedTeamId="team-frontend"
        onSelectTeam={fn()}
      />
    </div>
  ),
};

export const TeamListCompletedSelected: Story = {
  name: "TeamListPane / Completed Team Selected",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex h-[500px]">
      <TeamListPane
        teams={allTeams}
        selectedTeamId="team-api"
        onSelectTeam={fn()}
      />
    </div>
  ),
};

export const TeamListSingleTeam: Story = {
  name: "TeamListPane / Single Team",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex h-[500px]">
      <TeamListPane
        teams={[activeTeam]}
        selectedTeamId="team-frontend"
        onSelectTeam={fn()}
      />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   TeamStatsGrid
   ─────────────────────────────────────────────────────────── */

export const StatsGridActive: Story = {
  name: "TeamStatsGrid / Active Team",
  render: () => (
    <div className="w-[700px]">
      <TeamStatsGrid team={activeTeam} />
    </div>
  ),
};

export const StatsGridCompleted: Story = {
  name: "TeamStatsGrid / Completed Team",
  render: () => (
    <div className="w-[700px]">
      <TeamStatsGrid team={completedTeam} />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   TeamStatusTable
   ─────────────────────────────────────────────────────────── */

export const StatusTableActive: Story = {
  name: "TeamStatusTable / Active Team",
  render: () => (
    <div className="w-[700px]">
      <TeamStatusTable team={activeTeam} />
    </div>
  ),
};

export const StatusTableCompleted: Story = {
  name: "TeamStatusTable / All Completed",
  render: () => (
    <div className="w-[700px]">
      <TeamStatusTable team={completedTeam} />
    </div>
  ),
};

export const StatusTablePaused: Story = {
  name: "TeamStatusTable / Paused Team",
  render: () => (
    <div className="w-[700px]">
      <TeamStatusTable team={pausedTeam} />
    </div>
  ),
};
