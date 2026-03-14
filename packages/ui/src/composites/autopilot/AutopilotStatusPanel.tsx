import { Check, Pause, PlayCircle, RefreshCw, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { Switch } from "@/primitives/switch";
import { autopilotStateConfig } from "./config";
import type { AutopilotState } from "./types";

export function AutopilotStatusPanel({
  enabled,
  state,
  onToggleEnabled,
  onStart,
  onPause,
  onStop,
  onResume,
  onApprove,
  onDeny,
  onNewRun,
  onUnblock,
}: {
  enabled: boolean;
  state: AutopilotState;
  onToggleEnabled: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onResume: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onNewRun: () => void;
  onUnblock: () => void;
}) {
  const sc = autopilotStateConfig[state];

  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-foreground">Autopilot</h1>
        <Switch checked={enabled} onCheckedChange={onToggleEnabled} />
      </div>

      <div className={cn(
        "flex items-center gap-3 p-3 rounded border mb-4",
        state === "executing" ? "border-green/40 bg-green/5" :
        state === "waiting_approval" ? "border-warning/40 bg-warning/5" :
        state === "blocked" || state === "failed" ? "border-destructive/40 bg-destructive/5" :
        "border-border bg-surface-2"
      )}>
        <div className={cn("w-3 h-3 rounded-full", sc.bgColor, (state === "executing" || state === "planning") && "animate-pulse")} />
        <div className="flex-1">
          <div className={cn("text-[13px] font-medium", sc.color)}>{sc.label}</div>
          <div className="text-[11px] text-muted-foreground">Step 4 of 7 · 6.0k tokens used</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {state === "idle" && (
          <Button onClick={onStart} size="sm" className="h-8 gap-1.5 text-[12px]">
            <PlayCircle size={13} /> Start
          </Button>
        )}
        {(state === "executing" || state === "planning") && (
          <>
            <Button onClick={onPause} size="sm" className="h-8 gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90">
              <Pause size={13} /> Pause
            </Button>
            <Button onClick={onStop} variant="outline" size="sm" className="h-8 gap-1.5 border-destructive text-destructive hover:bg-destructive/10">
              <Square size={13} /> Stop
            </Button>
          </>
        )}
        {state === "paused" && (
          <Button onClick={onResume} size="sm" className="h-8 gap-1.5 text-[12px]">
            <PlayCircle size={13} /> Resume
          </Button>
        )}
        {state === "waiting_approval" && (
          <div className="flex items-center gap-2 w-full">
            <Button onClick={onApprove} size="sm" className="h-8 flex-1 justify-center gap-1.5 bg-success text-success-foreground hover:bg-success/90">
              <Check size={13} /> Approve
            </Button>
            <Button onClick={onDeny} variant="outline" size="sm" className="h-8 flex-1 justify-center gap-1.5 border-destructive text-destructive hover:bg-destructive/10">
              <X size={13} /> Deny
            </Button>
          </div>
        )}
        {(state === "complete" || state === "failed") && (
          <Button onClick={onNewRun} variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <RefreshCw size={13} /> New Run
          </Button>
        )}
        {state === "blocked" && (
          <Button onClick={onUnblock} variant="outline" size="sm" className="h-8 gap-1.5 border-warning text-warning hover:bg-warning/10">
            <RefreshCw size={13} /> Unblock
          </Button>
        )}
      </div>
    </div>
  );
}
