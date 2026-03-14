import { Search } from "lucide-react";

export function CommandPaletteSearch({
  query,
  onQueryChange,
  inputRef,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  inputRef: { current: HTMLInputElement | null };
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Search size={15} className="flex-shrink-0 text-muted-foreground" />
      <input
        ref={(element) => {
          inputRef.current = element;
          element?.focus();
        }}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search commands, files, agents, chat history..."
        className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd className="flex-shrink-0 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/60">ESC</kbd>
    </div>
  );
}
