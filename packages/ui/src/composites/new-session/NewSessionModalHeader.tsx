import { X, Zap } from "lucide-react";

export function NewSessionModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-primary" />
        <h2 className="text-[15px] font-semibold text-foreground">New Session</h2>
      </div>
      <button onClick={onClose} className="p-1 text-muted-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:text-foreground" aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
}
