import { FileText, GitBranch, Terminal as TermIcon } from "lucide-react";
import { cn } from '../../lib/utils.ts';

export function AutopilotConstraintsSection({
  allowedActions,
  onToggleAction,
  maxTokens,
  onMaxTokensChange,
  timeLimit,
  onTimeLimitChange,
}: {
  allowedActions: { file_edits: boolean; terminal: boolean; git: boolean };
  onToggleAction: (key: "file_edits" | "terminal" | "git") => void;
  maxTokens: string;
  onMaxTokensChange: (value: string) => void;
  timeLimit: string;
  onTimeLimitChange: (value: string) => void;
}) {
  const settings = [
    { label: "File edits", icon: FileText, key: "file_edits" as const },
    { label: "Terminal commands", icon: TermIcon, key: "terminal" as const },
    { label: "Git operations", icon: GitBranch, key: "git" as const },
  ];

  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Constraints & Limits</h3>
      <div className="space-y-2">
        <div className="space-y-1.5 mt-1">
          {settings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <setting.icon size={12} className="text-muted-foreground" />
                <span className="text-[12px] text-foreground">{setting.label}</span>
              </div>
              <button onClick={() => onToggleAction(setting.key)} className={cn("w-8 h-4 rounded-full relative transition-colors", allowedActions[setting.key] ? "bg-primary" : "bg-surface-3")}>
                <span className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-primary-foreground transition-transform", allowedActions[setting.key] ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-foreground">Max tokens per run</span>
          <input value={maxTokens} onChange={(event) => onMaxTokensChange(event.target.value)} className="w-20 bg-surface-2 border border-border rounded px-2 py-1 text-[12px] text-foreground font-mono text-right" />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-foreground">Time limit</span>
          <select value={timeLimit} onChange={(event) => onTimeLimitChange(event.target.value)} className="bg-surface-2 border border-border rounded px-2 py-1 text-[12px] text-foreground">
            <option>5 minutes</option>
            <option>15 minutes</option>
            <option>30 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
