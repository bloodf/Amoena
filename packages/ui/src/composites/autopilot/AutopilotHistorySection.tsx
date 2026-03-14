import { ChevronDown, ChevronRight } from "lucide-react";
import { autopilotStateConfig } from "./config";
import type { AutopilotRunHistoryItem } from "./types";

export function AutopilotHistorySection({
  showHistory,
  onToggle,
  history,
  onSelectRun,
}: {
  showHistory: boolean;
  onToggle: () => void;
  history: AutopilotRunHistoryItem[];
  onSelectRun: (run: AutopilotRunHistoryItem) => void;
}) {
  return (
    <div className="p-4">
      <button onClick={onToggle} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
        {showHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Run History
      </button>
      {showHistory && (
        <div className="space-y-1">
          {history.map((run) => {
            const config = autopilotStateConfig[run.state];
            return (
              <button key={run.id} onClick={() => onSelectRun(run)} className="flex items-center gap-2 py-2 px-2 rounded hover:bg-surface-2 transition-colors cursor-pointer w-full text-left">
                <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-foreground truncate">{run.goal}</div>
                  <div className="text-[10px] text-muted-foreground">{run.completed}/{run.steps} steps · {run.tokens} · {run.duration}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${config.color} ${config.bgColor}`}>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
