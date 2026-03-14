import { ArrowRight, Circle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeSessionItem } from "./types";

export function HomeRecentSessionsPanel({
  searchQuery,
  onSearchChange,
  sessions,
  onOpenSession,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sessions: HomeSessionItem[];
  onOpenSession: (session: HomeSessionItem) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recent Sessions</h2>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter sessions..."
            className="bg-surface-2 border border-border rounded pl-7 pr-2.5 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
        </div>
      </div>
      <div className="border border-border rounded overflow-hidden">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Search size={20} className="text-muted-foreground mb-2" />
            <div className="text-[12px] text-muted-foreground">No sessions match "{searchQuery}"</div>
          </div>
        ) : (
          sessions.map((session, index) => (
            <button
              key={`${session.title}-${session.branch}`}
              onClick={() => onOpenSession(session)}
              className={cn(
                "flex items-center w-full px-3 py-2.5 text-left hover:bg-surface-2 transition-colors group",
                index > 0 && "border-t border-border",
              )}
            >
              <Circle
                size={7}
                className={cn(
                  "fill-current flex-shrink-0",
                  session.tuiColor === "tui-claude" && "text-tui-claude",
                  session.tuiColor === "tui-opencode" && "text-tui-opencode",
                  session.tuiColor === "tui-codex" && "text-tui-codex",
                  session.tuiColor === "tui-gemini" && "text-tui-gemini",
                )}
              />
              <span className="text-[13px] text-foreground ml-3 flex-1 truncate">{session.title}</span>
              <span className="text-[11px] font-mono text-muted-foreground ml-4">{session.branch}</span>
              <span className="text-[11px] font-mono text-muted-foreground ml-4 w-12 text-right">{session.tokens}</span>
              <span className="text-[11px] text-muted-foreground ml-4 w-20 text-right">{session.time}</span>
              <ArrowRight size={12} className="text-muted-foreground ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </section>
  );
}
