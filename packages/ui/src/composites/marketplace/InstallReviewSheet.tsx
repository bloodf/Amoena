import { Package, Download, Shield, X, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketplaceItem } from "./types";

export function InstallReviewSheet({ item, onClose, onConfirm }: { item: MarketplaceItem; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[480px] bg-surface-1 border border-border rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Review Installation</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-[14px] font-medium text-foreground">{item.name}</div>
              <div className="text-[12px] text-muted-foreground">by {item.author} · v{item.version}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Trust Level</span>
              <span className={cn("flex items-center gap-1", item.trusted ? "text-green" : "text-warning")}>
                {item.trusted ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                {item.trusted ? "Trusted" : "Unverified"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Signature</span>
              <span className={cn(item.signed ? "text-green" : "text-warning")}>{item.signed ? "Signed" : "Unsigned"}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Compatibility</span>
              <span className="text-foreground font-mono">{item.compatibility}</span>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Permissions Requested</h3>
            <div className="space-y-1">
              {item.permissions.map(p => (
                <div key={p} className="flex items-center gap-2 py-1.5 px-3 rounded bg-surface-2 border border-border">
                  <Shield size={11} className="text-muted-foreground" />
                  <span className="text-[12px] text-foreground font-mono">{p}</span>
                </div>
              ))}
            </div>
          </div>
          {!item.signed && (
            <div className="flex items-start gap-2 p-3 rounded bg-warning/5 border border-warning/20">
              <AlertTriangle size={13} className="text-warning mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-muted-foreground">This package is unsigned. Install only if you trust the publisher.</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-muted-foreground cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-primary text-primary-foreground rounded cursor-pointer hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
            <Download size={14} /> Install
          </button>
        </div>
      </div>
    </div>
  );
}
