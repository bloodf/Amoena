import { useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MemoryTierCard,
  categoryConfig,
  type MemoryCategory,
} from "@/composites/shared/MemoryTierCard";

export interface MemoryTabEntry {
  id: string;
  title: string;
  type: string;
  category: MemoryCategory;
  timestamp: string;
  l0Summary: string;
  l1Summary?: string;
  l2Content?: string;
  isDuplicate?: boolean;
  sessionBoundaryLabel?: string;
}

const defaultEntries: MemoryTabEntry[] = [
  {
    id: "auth.strategy",
    title: "JWT refresh strategy",
    type: "working",
    category: "pattern",
    timestamp: "10:24",
    l0Summary: "Use rotating refresh tokens with per-turn validation.",
    l1Summary: "Session-local context for the current auth refactor.",
    l2Content: "Expanded long-form detail for the current auth flow.",
  },
  {
    id: "user.testing",
    title: "Testing preference",
    type: "session",
    category: "preference",
    timestamp: "09:52",
    l0Summary: "Prefer integration tests over unit mocks.",
    l1Summary: "Captured during an earlier review session.",
    l2Content: "Persisted long-term preference memory.",
    sessionBoundaryLabel: "Earlier session",
  },
];

const allCategories: MemoryCategory[] = [
  "profile",
  "preference",
  "entity",
  "pattern",
  "tool_usage",
  "skill",
];

const defaultTokenBudget = {
  total: 8192,
  l0: 450,
  l1: 1200,
  l2: 800,
};

export function MemoryTab({
  entries = defaultEntries,
  tokenBudget = defaultTokenBudget,
}: {
  entries?: MemoryTabEntry[];
  tokenBudget?: { total: number; l0: number; l1: number; l2: number };
}) {
  const [filterType, setFilterType] = useState<string>("all");
  const [activeCategories, setActiveCategories] = useState<Set<MemoryCategory>>(new Set());

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        if (filterType !== "all" && entry.type !== filterType) return false;
        if (activeCategories.size > 0 && !activeCategories.has(entry.category)) return false;
        return true;
      }),
    [activeCategories, entries, filterType],
  );

  const usedTokens = tokenBudget.l0 + tokenBudget.l1 + tokenBudget.l2;
  const l0Pct = (tokenBudget.l0 / tokenBudget.total) * 100;
  const l1Pct = (tokenBudget.l1 / tokenBudget.total) * 100;
  const l2Pct = (tokenBudget.l2 / tokenBudget.total) * 100;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Info size={9} />
            Context budget
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {usedTokens.toLocaleString()} / {tokenBudget.total.toLocaleString()} tokens
          </span>
        </div>
        <div aria-label="Memory token budget" className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div className="h-full bg-[#3B82F6] transition-all" style={{ width: `${l0Pct}%` }} title={`L0: ${tokenBudget.l0} tokens`} />
          <div className="h-full bg-[#7C3AED] transition-all" style={{ width: `${l1Pct}%` }} title={`L1: ${tokenBudget.l1} tokens`} />
          <div className="h-full bg-[#D97706] transition-all" style={{ width: `${l2Pct}%` }} title={`L2: ${tokenBudget.l2} tokens`} />
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3B82F6]" /> L0
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7C3AED]" /> L1
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D97706]" /> L2
          </span>
        </div>
      </div>

      <div className="p-3 border-b border-border flex-shrink-0 space-y-2">
        <input
          placeholder="Search memory..."
          className="w-full rounded border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="flex flex-wrap gap-1">
          {allCategories.map((category) => {
            const isActive = activeCategories.has(category);
            const config = categoryConfig[category];
            return (
              <button
                key={category}
                aria-pressed={isActive}
                onClick={() =>
                  setActiveCategories((previous) => {
                    const next = new Set(previous);
                    if (next.has(category)) next.delete(category);
                    else next.add(category);
                    return next;
                  })
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[9px] font-medium transition-all",
                  isActive
                    ? cn(config.bgClass, config.textClass, "border-current")
                    : "border-transparent bg-surface-2 text-muted-foreground hover:border-border",
                )}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            className="flex-1 rounded border border-border bg-surface-2 px-1.5 py-1 text-[10px] text-muted-foreground"
          >
            <option value="all">All Types</option>
            <option value="working">Working</option>
            <option value="session">Session</option>
            <option value="long-term">Long-term</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="space-y-2">
            {entry.sessionBoundaryLabel ? (
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                {entry.sessionBoundaryLabel}
              </div>
            ) : null}
            <MemoryTierCard
              id={entry.id}
              title={entry.title}
              type={entry.type}
              category={entry.category}
              timestamp={entry.timestamp}
              l0Summary={entry.l0Summary}
              l1Summary={entry.l1Summary}
              l2Content={entry.l2Content}
              isDuplicate={entry.isDuplicate}
            />
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-[12px] text-muted-foreground">No memories match filters</div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-2 flex-shrink-0">
        <button className="flex w-full items-center justify-center gap-1.5 rounded border border-primary/30 py-1.5 text-[11px] text-primary transition-colors hover:bg-primary/10">
          <Plus size={11} /> Add Memory
        </button>
      </div>
    </div>
  );
}
