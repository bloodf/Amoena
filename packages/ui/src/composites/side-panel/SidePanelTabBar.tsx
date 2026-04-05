import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import type { SidePanelTabDef, SidePanelTabId } from './data';

export function SidePanelTabBar({
  tabs,
  activeTab,
  visibleCount,
  dropIndex,
  dragIndex,
  containerRef,
  onSelect,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
}: {
  tabs: SidePanelTabDef[];
  activeTab: SidePanelTabId;
  visibleCount: number;
  dropIndex: number | null;
  dragIndex: number | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: SidePanelTabId) => void;
  onDragStart: (index: number) => void;
  onDragOver: (event: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
}) {
  const { t } = useTranslation();
  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);
  const showOverflow = overflowTabs.length > 0;
  const activeInOverflow = overflowTabs.some((tab) => tab.id === activeTab);

  return (
    <div
      ref={containerRef}
      className="flex flex-shrink-0 overflow-hidden border-b border-border"
      onDragLeave={onDragLeave}
    >
      {visibleTabs.map((tab, index) => (
        <div key={tab.id} className="relative min-w-0 flex-1">
          {dropIndex === index && dragIndex !== null && dragIndex !== index ? (
            <div className="absolute bottom-1 left-0 top-1 z-10 w-[2px] rounded-full bg-primary" />
          ) : null}
          <button
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(event) => onDragOver(event, index)}
            onDragEnd={onDragEnd}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'flex w-full min-w-0 cursor-grab items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-medium transition-colors active:cursor-grabbing',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
              dragIndex === index && 'opacity-40',
            )}
          >
            <tab.icon size={12} className="flex-shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        </div>
      ))}
      {showOverflow ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t('ui.moreSidePanelTabs')}
              className={cn(
                'flex w-8 flex-shrink-0 items-center justify-center py-2 text-muted-foreground transition-colors hover:text-foreground',
                activeInOverflow && 'border-b-2 border-primary text-foreground',
              )}
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[120px]">
            {overflowTabs.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                onClick={() => onSelect(tab.id)}
                className={cn(
                  'flex items-center gap-2 text-[12px]',
                  activeTab === tab.id && 'font-medium text-primary',
                )}
              >
                <tab.icon size={12} />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
