import React from "react";
import { useTranslation } from "react-i18next";

interface HookRecord {
  id: string;
  eventName: string;
  handlerType: string;
  handlerConfig: Record<string, unknown>;
  enabled: boolean;
  priority: number;
  timeoutMs: number;
}

interface HookManagementPanelProps {
  hooks: HookRecord[];
  onDelete: (hookId: string) => void;
  onFire: (eventName: string) => void;
}

const eventGroups: Record<string, string[]> = {
  Session: ["SessionStart", "SessionEnd"],
  Tools: ["PreToolUse", "PostToolUse", "PostToolUseFailure"],
  Agents: ["SubagentStart", "SubagentStop", "TeammateIdle"],
  Memory: ["MemoryObserve", "MemoryInject"],
  Autopilot: ["AutopilotStoryStart", "AutopilotStoryComplete"],
  System: ["ConfigChange", "ProviderSwitch", "ErrorUnhandled", "Stop", "Notification"],
};

function getHandlerLabel(hook: HookRecord, promptInjectionLabel: string): string {
  if (hook.handlerType === "command") {
    return String((hook.handlerConfig as Record<string, unknown>).command ?? "");
  }
  if (hook.handlerType === "http") {
    return String((hook.handlerConfig as Record<string, unknown>).url ?? "");
  }
  if (hook.handlerType === "prompt") {
    return promptInjectionLabel;
  }
  if (hook.handlerType === "agent") {
    return `Agent: ${String((hook.handlerConfig as Record<string, unknown>).agentType ?? "")}`;
  }
  return "";
}

export function HookManagementPanel({ hooks, onDelete, onFire }: HookManagementPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold">{t("hooks.title")}</h3>

      {hooks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("hooks.empty")}</p>
      )}

      {hooks.map((hook) => (
        <div key={hook.id} className="flex items-start gap-3 p-3 rounded border bg-card">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium">{hook.eventName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{hook.handlerType}</span>
              {!hook.enabled && (
                <span className="text-xs text-muted-foreground">{t("hooks.disabled")}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {getHandlerLabel(hook, t("hooks.promptInjection"))}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onFire(hook.eventName)}
              className="text-xs px-2 py-1 rounded border hover:bg-muted"
            >
              {t("hooks.test")}
            </button>
            <button
              onClick={() => onDelete(hook.id)}
              className="text-xs px-2 py-1 rounded border hover:bg-destructive hover:text-destructive-foreground"
            >
              {t("hooks.delete")}
            </button>
          </div>
        </div>
      ))}

      <div className="mt-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">{t("hooks.availableEvents")}</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(eventGroups).map(([group, events]) => (
            <div key={group} className="text-xs">
              <span className="font-medium">{group}:</span>{" "}
              <span className="text-muted-foreground">{events.join(", ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
