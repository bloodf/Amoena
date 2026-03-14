import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, AlertTriangle, Merge, X } from "lucide-react";

export type MemoryCategory = "profile" | "preference" | "entity" | "pattern" | "tool_usage" | "skill";

export interface MemoryTierCardProps {
  id: string;
  title: string;
  type: string;
  category: MemoryCategory;
  timestamp: string;
  l0Summary: string;
  l1Summary?: string;
  l2Content?: string;
  isDuplicate?: boolean;
  onMerge?: () => void;
  onDismiss?: () => void;
}

const categoryConfig: Record<MemoryCategory, { label: string; color: string; bgClass: string; textClass: string }> = {
  profile: { label: "Profile", color: "#3B82F6", bgClass: "bg-[#3B82F6]/15", textClass: "text-[#3B82F6]" },
  preference: { label: "Preference", color: "#7C3AED", bgClass: "bg-[#7C3AED]/15", textClass: "text-[#7C3AED]" },
  entity: { label: "Entity", color: "#0891B2", bgClass: "bg-[#0891B2]/15", textClass: "text-[#0891B2]" },
  pattern: { label: "Pattern", color: "#D97706", bgClass: "bg-[#D97706]/15", textClass: "text-[#D97706]" },
  tool_usage: { label: "Tool Usage", color: "#16A34A", bgClass: "bg-[#16A34A]/15", textClass: "text-[#16A34A]" },
  skill: { label: "Skill", color: "#B800B8", bgClass: "bg-[#B800B8]/15", textClass: "text-[#B800B8]" },
};

type TierLevel = "l0" | "l1" | "l2";

export function MemoryTierCard({
  title,
  type,
  category,
  timestamp,
  l0Summary,
  l1Summary,
  l2Content,
  isDuplicate,
  onMerge,
  onDismiss,
}: MemoryTierCardProps) {
  const [tier, setTier] = useState<TierLevel>("l0");
  const config = categoryConfig[category];

  const expand = () => {
    if (tier === "l0" && l1Summary) setTier("l1");
    else if (tier === "l1" && l2Content) setTier("l2");
  };

  const collapse = () => {
    if (tier === "l2") setTier("l1");
    else if (tier === "l1") setTier("l0");
  };

  return (
    <div className="rounded-lg border border-border bg-surface-1 transition-colors hover:border-primary/30">
      {/* L0 — Always visible */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          onClick={tier === "l0" ? expand : collapse}
          className="flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label={tier === "l0" ? "Expand" : "Collapse"}
        >
          {tier === "l0" ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[12px] font-medium text-foreground">{title}</span>
          <span className={cn("flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium", config.bgClass, config.textClass)}>
            {config.label}
          </span>
        </div>

        <span className="flex-shrink-0 text-[10px] text-muted-foreground">{timestamp}</span>
      </div>

      {/* Duplicate indicator */}
      {isDuplicate ? (
        <div className="mx-2.5 mb-2 flex items-center gap-2 rounded border border-[#D97706]/30 bg-[#D97706]/10 px-2 py-1.5">
          <AlertTriangle size={11} className="flex-shrink-0 text-[#D97706]" />
          <span className="flex-1 text-[10px] font-medium text-[#D97706]">Duplicate detected</span>
          <div className="flex items-center gap-1">
            {onMerge ? (
              <button
                onClick={onMerge}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#D97706] transition-colors hover:bg-[#D97706]/20"
              >
                <Merge size={10} /> Merge
              </button>
            ) : null}
            {onDismiss ? (
              <button
                onClick={onDismiss}
                className="rounded p-0.5 text-[#D97706] transition-colors hover:bg-[#D97706]/20"
                aria-label="Dismiss duplicate"
              >
                <X size={10} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* L0 summary line */}
      <div className="px-2.5 pb-2 text-[11px] text-muted-foreground">
        <span className="font-mono text-[10px] text-muted-foreground/70">{type}</span>
        <span className="mx-1.5 text-muted-foreground/40">·</span>
        {l0Summary}
      </div>

      {/* L1 — Expanded details */}
      {tier !== "l0" && l1Summary ? (
        <div className="border-t border-border px-2.5 py-2">
          <div className="text-[11px] leading-relaxed text-foreground/80">{l1Summary}</div>
          {tier === "l1" && l2Content ? (
            <button
              onClick={() => setTier("l2")}
              className="mt-1.5 text-[10px] text-primary transition-colors hover:text-primary/80"
            >
              Full details
            </button>
          ) : null}
        </div>
      ) : null}

      {/* L1 expand button when at L0 */}
      {tier === "l0" && l1Summary ? (
        <div className="border-t border-border px-2.5 py-1.5">
          <button
            onClick={expand}
            className="text-[10px] text-primary transition-colors hover:text-primary/80"
          >
            Show more
          </button>
        </div>
      ) : null}

      {/* L2 — Full content */}
      {tier === "l2" && l2Content ? (
        <div className="border-t border-border bg-surface-2/50 px-2.5 py-2">
          <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90">{l2Content}</div>
        </div>
      ) : null}
    </div>
  );
}

export { categoryConfig };
