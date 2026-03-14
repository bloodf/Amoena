import { Eye, EyeOff, Lock, RefreshCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { SurfacePanel } from "@/components/patterns";

interface RemotePairingPanelProps {
  pin: string;
  expiryLabel: string;
  showPin: boolean;
  onTogglePin: () => void;
  onRegenerate: () => void;
}

export function RemotePairingPanel({
  pin,
  expiryLabel,
  showPin,
  onTogglePin,
  onRegenerate,
}: RemotePairingPanelProps) {
  return (
    <SurfacePanel className="flex flex-col items-center py-8">
      <div className="mb-4 flex h-[200px] w-[200px] items-center justify-center rounded-sm bg-foreground p-4">
        <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-[2px] rounded-sm bg-surface-0 p-2">
          {Array.from({ length: 64 }, (_, index) => (
            <div key={index} className={Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"} />
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className={cn("select-none text-[32px] font-semibold tracking-[0.3em] text-foreground font-mono", !showPin && "blur-sm")}>
          {pin}
        </div>
        <Button onClick={onTogglePin} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <span className="sr-only">{showPin ? "Hide PIN" : "Show PIN"}</span>
          {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-green" />
          <span className="text-[12px] text-muted-foreground">LAN Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={12} className="text-green" />
          <span className="text-[12px] text-green">End-to-end encrypted</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onRegenerate}
          variant="outline"
          size="sm"
          className="h-8 text-[12px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <RefreshCw size={12} />
          Regenerate
        </Button>
        <span className="font-mono text-[10px] text-muted-foreground">Expires in {expiryLabel}</span>
      </div>
    </SurfacePanel>
  );
}
