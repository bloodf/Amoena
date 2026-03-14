import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { contextUsage, runtimeConfig, type RuntimeLocation } from "@/composites/status-bar/data";
import { RuntimeMenu } from "@/composites/status-bar/RuntimeMenu";
import { RateLimitsMenu } from "@/composites/status-bar/RateLimitsMenu";
import { useState } from "react";

export function StatusBar() {
  const [showRateLimits, setShowRateLimits] = useState(false);
  const [runtimeLocation, setRuntimeLocation] = useState<RuntimeLocation>("local");
  const [showRuntimeMenu, setShowRuntimeMenu] = useState(false);

  const contextPercent = Math.round((contextUsage.used / contextUsage.limit) * 100);
  const ContextIcon = contextUsage.icon;

  return (
    <div className="flex h-7 flex-shrink-0 items-center gap-1 border-t border-border bg-surface-0 px-3 font-mono text-[11px] select-none">
      <RuntimeMenu
        open={showRuntimeMenu}
        runtimeLocation={runtimeLocation}
        onToggle={() => {
          setShowRuntimeMenu((value) => !value);
          setShowRateLimits(false);
        }}
        onClose={() => setShowRuntimeMenu(false)}
        onSelect={(location) => {
          setRuntimeLocation(location);
          setShowRuntimeMenu(false);
        }}
      />

      <div className="h-3.5 w-px bg-border" />

      <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground">
        <ContextIcon size={11} />
        <span>{(contextUsage.used / 1000).toFixed(1)}k / {(contextUsage.limit / 1000).toFixed(0)}k</span>
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-3">
          <div
            className={cn("h-full rounded-full transition-all", contextPercent > 80 ? "bg-destructive" : contextPercent > 50 ? "bg-warning" : "bg-primary")}
            style={{ width: `${contextPercent}%` }}
          />
        </div>
      </div>

      <div className="h-3.5 w-px bg-border" />

      <RateLimitsMenu
        open={showRateLimits}
        onToggle={() => {
          setShowRateLimits((value) => !value);
          setShowRuntimeMenu(false);
        }}
        onClose={() => setShowRateLimits(false)}
      />

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground">
        <Circle size={5} className="fill-green text-green" />
        <span className="text-[10px]">3 agents</span>
      </div>

      <div className="h-3.5 w-px bg-border" />

      <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground">
        <Circle size={5} className="fill-green text-green" />
        <span className="text-[10px]">1 device</span>
      </div>
    </div>
  );
}
