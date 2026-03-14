import { Zap, Terminal, Bot, Sparkles, Cpu, Brain, FileText, GitBranch, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const providerInfo: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  lunaria: { label: "Lunaria AI", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  claude: { label: "Claude Code", icon: Bot, color: "text-tui-claude", bg: "bg-tui-claude/10" },
  opencode: { label: "OpenCode", icon: Terminal, color: "text-tui-opencode", bg: "bg-tui-opencode/10" },
  codex: { label: "Codex CLI", icon: Cpu, color: "text-tui-codex", bg: "bg-tui-codex/10" },
  gemini: { label: "Gemini CLI", icon: Sparkles, color: "text-tui-gemini", bg: "bg-tui-gemini/10" },
  ollama: { label: "Ollama", icon: Cpu, color: "text-foreground", bg: "bg-surface-2" },
};

const suggestions = [
  { label: "Refactor a module", prompt: "Refactor the authentication module to use JWT tokens", icon: FileText },
  { label: "Fix a bug", prompt: "Debug and fix the race condition in the WebSocket handler", icon: Lightbulb },
  { label: "Start a new feature", prompt: "Create a new rate-limiting middleware with Redis", icon: Zap },
  { label: "Review code", prompt: "Review the latest PR for security and performance issues", icon: GitBranch },
];

interface EmptySessionStateProps {
  provider: string;
  model: string;
  sessionName: string;
  onSuggestionClick?: (prompt: string) => void;
}

export function EmptySessionState({ provider, model, sessionName, onSuggestionClick }: EmptySessionStateProps) {
  const info = providerInfo[provider] || providerInfo.lunaria;
  const Icon = info.icon;

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-[520px] w-full space-y-8 text-center">
        {/* Provider icon + name */}
        <div className="flex flex-col items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", info.bg)}>
            <Icon size={32} className={info.color} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">{sessionName}</h2>
            <p className="text-[13px] text-muted-foreground">
              Powered by <span className={cn("font-medium", info.color)}>{info.label}</span>
              <span className="text-muted-foreground/60"> · {model}</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 px-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Get started</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => onSuggestionClick?.(s.prompt)}
              className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-surface-2/50 transition-all text-left"
            >
              <s.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <span className="text-[13px] font-medium text-foreground block">{s.label}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">{s.prompt}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[10px]">/</kbd> commands
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[10px]">@</kbd> files
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[10px]">$</kbd> skills
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-[10px]">Ctrl+T</kbd> variants
          </span>
        </div>
      </div>
    </div>
  );
}
