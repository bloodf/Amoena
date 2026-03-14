import { Paperclip } from "lucide-react";

export function ContextDropzone() {
  return (
    <button className="flex w-full items-center gap-2 rounded border border-dashed border-border px-3 py-2.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
      <Paperclip size={13} />
      Drop files or click to attach context...
    </button>
  );
}
