import { Zap } from "lucide-react";
import { Button } from "@/primitives/button";

export function NewSessionModalFooter({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
      <Button onClick={onClose} variant="ghost" className="text-[13px] text-muted-foreground">
        Cancel
      </Button>
      <Button onClick={onCreate} className="gap-2 px-5 text-[13px] font-medium">
        <Zap size={14} />
        Create Session
      </Button>
    </div>
  );
}
