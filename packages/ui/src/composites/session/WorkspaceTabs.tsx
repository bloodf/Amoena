import { Circle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileIcon } from "../file-browser/utils";
import type { SessionRecord, WorkspaceTabItem } from "./types";

interface WorkspaceTabsProps {
  tabs: WorkspaceTabItem[];
  sessions: SessionRecord[];
  activeTabId: string;
  dragIndex: number | null;
  dropIndex: number | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, event: React.MouseEvent) => void;
  onTabCloseKey: (id: string, event: React.KeyboardEvent) => void;
  onTabDragStart: (index: number) => void;
  onTabDragOver: (event: React.DragEvent, index: number) => void;
  onTabDragEnd: () => void;
  onDragLeave: () => void;
  onNewSession: () => void;
}

function getSessionForTab(tab: WorkspaceTabItem, sessions: SessionRecord[]) {
  if (tab.type !== "session") return null;
  return sessions.find((session) => session.id === tab.id) || null;
}

function getTabLabel(tab: WorkspaceTabItem, sessions: SessionRecord[]) {
  if (tab.type === "file") return tab.fileName;
  return sessions.find((session) => session.id === tab.id)?.title || "Session";
}

export function WorkspaceTabs({
  tabs,
  sessions,
  activeTabId,
  dragIndex,
  dropIndex,
  onTabClick,
  onTabClose,
  onTabCloseKey,
  onTabDragStart,
  onTabDragOver,
  onTabDragEnd,
  onDragLeave,
  onNewSession,
}: WorkspaceTabsProps) {
  return (
    <div className="flex items-center h-9 border-b border-border bg-surface-0 flex-shrink-0">
      <div className="flex items-center flex-1 min-w-0 overflow-x-auto" onDragLeave={onDragLeave}>
        {tabs.map((tab, index) => {
          const session = getSessionForTab(tab, sessions);

          return (
            <div key={tab.id} className="relative flex-shrink-0">
              {dropIndex === index && dragIndex !== null && dragIndex !== index && (
                <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-primary z-10 rounded-full" />
              )}
              <button
                draggable
                onDragStart={() => onTabDragStart(index)}
                onDragOver={(event) => onTabDragOver(event, index)}
                onDragEnd={onTabDragEnd}
                onClick={() => onTabClick(tab.id)}
                className={cn(
                  "group relative flex items-center gap-2 h-9 px-3 text-[12px] border-r border-border transition-colors min-w-0 max-w-[200px] cursor-grab active:cursor-grabbing",
                  activeTabId === tab.id
                    ? "bg-surface-1 text-foreground"
                    : "bg-surface-0 text-muted-foreground hover:bg-surface-2/30 hover:text-foreground",
                  dragIndex === index && "opacity-40",
                )}
              >
                {activeTabId === tab.id && <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />}
                {tab.type === "session" && session ? (
                  <Circle
                    size={7}
                    className={cn(
                      "fill-current flex-shrink-0",
                      session.provider === "claude" && "text-tui-claude",
                      session.provider === "opencode" && "text-tui-opencode",
                      session.provider === "codex" && "text-tui-codex",
                      session.provider === "gemini" && "text-tui-gemini",
                      session.provider === "lunaria" && "text-primary",
                    )}
                  />
                ) : tab.type === "file" ? (
                  getFileIcon(tab.fileName, 12)
                ) : null}
                <span className="truncate font-mono">{getTabLabel(tab, sessions)}</span>
                {tab.type === "session" && session?.hasActivity && activeTabId !== tab.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => onTabClose(tab.id, event as unknown as React.MouseEvent)}
                  onKeyDown={(event) => onTabCloseKey(tab.id, event)}
                  className={cn(
                    "flex-shrink-0 p-0.5 rounded hover:bg-surface-3 transition-colors",
                    activeTabId === tab.id ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60",
                  )}
                >
                  <X size={10} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={onNewSession}
        className="flex items-center justify-center h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors"
        title="New Session"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
