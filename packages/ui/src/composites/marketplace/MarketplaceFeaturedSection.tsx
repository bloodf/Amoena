import { CheckCircle, Download, Star } from "lucide-react";
import type { MarketplaceItem } from "./types";

interface MarketplaceFeaturedSectionProps {
  items: MarketplaceItem[];
  onSelect: (item: MarketplaceItem) => void;
  onInstallRequest: (item: MarketplaceItem) => void;
}

export function MarketplaceFeaturedSection({ items, onSelect, onInstallRequest }: MarketplaceFeaturedSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Featured & Recommended</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="border border-primary/20 rounded-lg p-4 bg-primary/5 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Star size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-foreground">{item.name}</span>
                  {item.trusted && <CheckCircle size={10} className="text-green" />}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {item.author} · {item.installs} · <Star size={9} className="inline text-warning fill-warning" /> {item.rating.toFixed(1)}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{item.desc}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onInstallRequest(item);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
              >
                <Download size={10} /> Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
