import { useMemo, useState } from "react";
import type { CommandPaletteItem } from "./data";

export function useCommandPaletteState(commands: CommandPaletteItem[], onClose: () => void) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const filtered = useMemo(
    () =>
      commands.filter(
        (command) =>
          command.label.toLowerCase().includes(query.toLowerCase()) ||
          command.description?.toLowerCase().includes(query.toLowerCase()),
      ),
    [commands, query],
  );

  const groups = useMemo(
    () =>
      filtered.reduce<Record<string, CommandPaletteItem[]>>((accumulator, item) => {
        if (!accumulator[item.type]) accumulator[item.type] = [];
        accumulator[item.type].push(item);
        return accumulator;
      }, {}),
    [filtered],
  );

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const runAction = (action?: () => void) => {
    action?.();
    handleClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[selectedIndex]?.action) runAction(filtered[selectedIndex].action);
    }
  };

  return {
    query,
    selectedIndex,
    isClosing,
    filtered,
    groups,
    setQuery,
    setSelectedIndex,
    handleClose,
    runAction,
    handleKeyDown,
  };
}
