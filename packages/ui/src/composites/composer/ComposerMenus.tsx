import { Check, ChevronDown, GitBranch, ImagePlus, Plus, Shield, ToggleLeft, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComposerOption, ComposerPermissionOption, ComposerReasoningLevel } from "./types";
import { ComposerDropdown } from "./ComposerToolbar";

export function ComposerActionsMenu({
  open,
  onClose,
  planMode,
  onTogglePlanMode,
}: {
  open: boolean;
  onClose: () => void;
  planMode: boolean;
  onTogglePlanMode: () => void;
}) {
  return (
    <div className="relative">
      <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-56">
        <button className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
          <ImagePlus size={14} className="text-muted-foreground" />
          <span className="text-[12px] text-foreground">Add photos & files</span>
        </button>
        <div className="border-t border-border" />
        <button onClick={onTogglePlanMode} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
          <ToggleLeft size={14} className="text-muted-foreground" />
          <span className="text-[12px] text-foreground">Plan mode</span>
          <div className={cn("relative ml-auto h-4 w-8 rounded-full", planMode ? "bg-primary/30" : "bg-surface-3")}>
            <div className={cn("absolute top-0.5 h-3 w-3 rounded-full", planMode ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground")} />
          </div>
        </button>
      </ComposerDropdown>
    </div>
  );
}

export function ComposerAgentMenu({
  open,
  onClose,
  agents,
  activeAgentId,
  onSelectAgent,
}: {
  open: boolean;
  onClose: () => void;
  agents: { id: string; name: string; role: string; color: string }[];
  activeAgentId: string;
  onSelectAgent: (id: string) => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-64">
      <div className="border-b border-border px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Agent Variant</span>
      </div>
      {agents.map((agent) => (
        <button key={agent.id} onClick={() => onSelectAgent(agent.id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", agent.id === activeAgentId && "bg-surface-2")}>
          <Users size={12} className={agent.color} />
          <span className={cn("font-mono text-[12px]", agent.color)}>{agent.name}</span>
          <span className="text-[10px] text-muted-foreground">({agent.role})</span>
          <div className="flex-1" />
          {agent.id === activeAgentId ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}

export function ComposerModelMenu({
  open,
  onClose,
  models,
  activeModelId,
  onSelectModel,
}: {
  open: boolean;
  onClose: () => void;
  models: { id: string; label: string }[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-52">
      <div className="border-b border-border px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</span>
      </div>
      {models.map((model) => (
        <button key={model.id} onClick={() => onSelectModel(model.id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", model.id === activeModelId && "bg-surface-2")}>
          <Zap size={11} className={model.id === activeModelId ? "text-primary" : "text-muted-foreground"} />
          <span className="flex-1 font-mono text-[12px] text-foreground">{model.label}</span>
          {model.id === activeModelId ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}

export function ComposerReasoningMenu({
  open,
  onClose,
  reasoningLevels,
  reasoningLevel,
  onSelectReasoning,
}: {
  open: boolean;
  onClose: () => void;
  reasoningLevels: ComposerReasoningLevel[];
  reasoningLevel: string;
  onSelectReasoning: (id: string) => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-52">
      <div className="border-b border-border px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reasoning</span>
      </div>
      {reasoningLevels.map((level) => (
        <button key={level.id} onClick={() => onSelectReasoning(level.id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", level.id === reasoningLevel && "bg-surface-2")}>
          <span className="flex-1 font-mono text-[12px] text-foreground">{level.label}</span>
          <span className="text-[10px] text-muted-foreground">{level.desc}</span>
          {level.id === reasoningLevel ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}

export function ComposerContinueMenu({
  open,
  onClose,
  options,
  current,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  options: ComposerOption[];
  current: "local" | "worktree" | "cloud";
  onSelect: (id: "local" | "worktree" | "cloud") => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-48">
      {options.map((option) => (
        <button key={option.id} onClick={() => onSelect(option.id as "local" | "worktree" | "cloud")} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", option.id === current && "bg-surface-2")}>
          <option.icon size={12} className="text-muted-foreground" />
          <span className="flex-1 text-[12px] text-foreground">{option.label}</span>
          {option.id === current ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}

export function ComposerPermissionMenu({
  open,
  onClose,
  options,
  current,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  options: ComposerPermissionOption[];
  current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-52">
      {options.map((option) => (
        <button key={option.id} onClick={() => onSelect(option.id)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", option.id === current && "bg-surface-2")}>
          <Shield size={11} className={option.id === "full" ? "text-warning" : "text-muted-foreground"} />
          <span className="flex-1 text-[12px] text-foreground">{option.label}</span>
          {option.id === current ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}

export function ComposerBranchMenu({
  open,
  onClose,
  branchOptions,
  current,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  branchOptions: string[];
  current: string;
  onSelect: (branch: string) => void;
}) {
  return (
    <ComposerDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-56">
      {branchOptions.map((branch) => (
        <button key={branch} onClick={() => onSelect(branch)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2", branch === current && "bg-surface-2")}>
          <GitBranch size={11} className="text-muted-foreground" />
          <span className="flex-1 truncate font-mono text-[12px] text-foreground">{branch}</span>
          {branch === current ? <Check size={12} className="text-primary" /> : null}
        </button>
      ))}
    </ComposerDropdown>
  );
}
