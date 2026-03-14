import type { HomeQuickTip } from "./types";

export function HomeQuickTipsPanel({ tips }: { tips: HomeQuickTip[] }) {
  return (
    <section>
      <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Tips</h2>
      <div className="space-y-1.5 border border-border rounded p-3">
        {tips.map((tip) => (
          <div key={`${tip.shortcut}-${tip.tip}`} className="flex items-center gap-2 py-1">
            <kbd className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 flex-shrink-0 min-w-[28px] text-center">
              {tip.shortcut}
            </kbd>
            <span className="text-[12px] text-muted-foreground">{tip.tip}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
