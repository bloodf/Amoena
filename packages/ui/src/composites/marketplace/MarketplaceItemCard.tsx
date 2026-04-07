import { Package, Download, Star, Trash2, CheckCircle } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import type { MarketplaceItem } from "./types";

export function MarketplaceItemCard({ item, isSelected, onSelect, onInstall, onUninstall }: {
  item: MarketplaceItem;
  isSelected: boolean;
  onSelect: () => void;
  onInstall: () => void;
  onUninstall: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "border rounded-lg p-4 transition-all cursor-pointer group",
        isSelected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-surface-2/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors",
          item.featured
            ? "bg-primary/10 border-primary/20"
            : "bg-surface-2 border-border"
        )}>
          {item.featured ? (
            <Star size={16} className="text-primary" />
          ) : (
            <Package size={16} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-foreground truncate">{item.name}</span>
            {item.trusted && <CheckCircle size={11} className="text-green flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{item.author}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">{item.installs}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Star size={9} className="text-warning fill-warning" /> {item.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{item.desc}</p>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border">
              {t}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{item.tags.length - 3}</span>
          )}
        </div>
        {item.installed ? (
          <button
            onClick={e => { e.stopPropagation(); onUninstall(); }}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-destructive border border-destructive/30 rounded hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={10} /> Uninstall
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onInstall(); }}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
          >
            <Download size={10} /> Install
          </button>
        )}
      </div>
    </div>
  );
}
