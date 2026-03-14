import { Package, Download, Trash2, Star, Shield, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketplaceItem } from "./types";

export function ItemDetailPanel({ item, onInstall, onUninstall, onClose }: {
  item: MarketplaceItem;
  onInstall: () => void;
  onUninstall: () => void;
  onClose: () => void;
}) {
  return (
    <div className="w-[320px] border-l border-border flex-shrink-0 overflow-y-auto bg-surface-1">
      <div className="p-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 border border-border">
            <Package size={22} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-foreground">{item.name}</h2>
            <div className="text-[12px] text-muted-foreground mt-0.5">by {item.author}</div>
          </div>
        </div>

        <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>

        <div className="flex items-center gap-4">
          {item.installed ? (
            <button onClick={onUninstall} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-destructive border border-destructive/40 rounded cursor-pointer hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
              <Trash2 size={13} /> Uninstall
            </button>
          ) : (
            <button onClick={onInstall} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium bg-primary text-primary-foreground rounded cursor-pointer hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
              <Download size={13} /> Install
            </button>
          )}
        </div>

        <div className="space-y-2.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-foreground">v{item.version}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Installs</span>
            <span className="text-foreground">{item.installs}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Rating</span>
            <span className="flex items-center gap-1 text-foreground">
              <Star size={11} className="text-warning fill-warning" /> {item.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Category</span>
            <span className="text-foreground">{item.category}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Updated</span>
            <span className="text-foreground">{item.lastUpdated}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Trust</span>
            <span className={cn("flex items-center gap-1", item.trusted ? "text-green" : "text-warning")}>
              {item.trusted ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
              {item.trusted ? "Trusted" : "Unverified"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Signed</span>
            <span className={cn(item.signed ? "text-green" : "text-warning")}>{item.signed ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Compat</span>
            <span className="font-mono text-foreground">{item.compatibility}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Permissions</h3>
          <div className="flex flex-wrap gap-1.5">
            {item.permissions.map(p => (
              <span key={p} className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-surface-2 border border-border text-muted-foreground">
                <Shield size={9} /> {p}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
