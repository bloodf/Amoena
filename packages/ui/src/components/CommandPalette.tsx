import { useNavigate } from "react-router-dom";
import { buildCommandPaletteItems, type CommandPaletteItem } from "@/composites/command-palette/data";
import { CommandPaletteFooter } from "@/composites/command-palette/CommandPaletteFooter";
import { CommandPaletteFrame } from "@/composites/command-palette/CommandPaletteFrame";
import { CommandPaletteResults } from "@/composites/command-palette/CommandPaletteResults";
import { CommandPaletteSearch } from "@/composites/command-palette/CommandPaletteSearch";
import { useCommandPaletteState } from "@/composites/command-palette/useCommandPaletteState";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = { current: null as HTMLInputElement | null };
  const navigate = useNavigate();

  const commands: CommandPaletteItem[] = buildCommandPaletteItems(navigate);
  const { query, selectedIndex, isClosing, filtered, groups, setQuery, setSelectedIndex, handleClose, runAction, handleKeyDown } =
    useCommandPaletteState(commands, onClose);

  // Reset on open
  if (open && query === "" && selectedIndex !== 0) {
    setSelectedIndex(0);
  }

  if (!open) return null;

  return (
    <CommandPaletteFrame isClosing={isClosing} onClose={handleClose} onKeyDown={handleKeyDown}>
      <CommandPaletteSearch query={query} onQueryChange={(value) => { setQuery(value); setSelectedIndex(0); }} inputRef={inputRef} />
      <div className="max-h-[340px] overflow-y-auto py-1">
        {filtered.length === 0 ? <div className="py-8 text-center text-[13px] text-muted-foreground">No results found</div> : null}
        <CommandPaletteResults groups={groups} selectedIndex={selectedIndex} onHover={setSelectedIndex} onSelect={(item) => runAction(item.action)} />
      </div>
      <CommandPaletteFooter />
    </CommandPaletteFrame>
  );
}
