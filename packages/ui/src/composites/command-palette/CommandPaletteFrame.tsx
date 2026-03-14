import { cn } from "@/lib/utils";

export function CommandPaletteFrame({
  isClosing,
  onClose,
  onKeyDown,
  children,
}: {
  isClosing: boolean;
  onClose: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-start justify-center pt-[18vh] transition-opacity duration-150", isClosing ? "opacity-0" : "opacity-100")}
      onClick={onClose}
    >
      <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150", isClosing ? "opacity-0" : "opacity-100")} />
      <div
        className={cn(
          "relative w-[520px] overflow-hidden rounded-lg border border-border bg-surface-1 shadow-2xl transition-all duration-150",
          isClosing ? "translate-y-2 scale-95 opacity-0" : "translate-y-0 scale-100 animate-scale-in opacity-100",
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
