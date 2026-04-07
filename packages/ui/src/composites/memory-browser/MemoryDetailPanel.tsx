import { Check, Download, ExternalLink, Pin, Trash2, X } from 'lucide-react';
import { Button } from '../../primitives/button.tsx';
import { ScreenHeader, ScreenHeaderCopy, ScreenTitle } from '../../components/screen.tsx';
import { memoryTypeConfig, type MemoryEntry } from './types';
import { cn } from '../../lib/utils.ts';

export function MemoryDetailPanel({
  entry,
  confirmDelete,
  onTogglePin,
  onExport,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onConvertToPersistent,
}: {
  entry: MemoryEntry | null;
  confirmDelete: string | null;
  onTogglePin: (key: string) => void;
  onExport: () => void;
  onAskDelete: (key: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (key: string) => void;
  onConvertToPersistent: (key: string) => void;
}) {
  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
        Select a memory entry
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader className="mb-4">
        <ScreenHeaderCopy className="flex items-center gap-2">
          {entry.pinned ? <Pin size={14} className="text-primary" /> : null}
          <ScreenTitle className="font-mono text-lg font-medium">{entry.key}</ScreenTitle>
        </ScreenHeaderCopy>
        <div className="flex gap-1.5">
          <Button
            onClick={() => onTogglePin(entry.key)}
            variant="ghost"
            size="icon"
            className={cn(
              entry.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary',
            )}
          >
            <Pin size={14} />
          </Button>
          <Button
            onClick={onExport}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Download size={14} />
          </Button>
          {confirmDelete === entry.key ? (
            <div className="flex items-center gap-1">
              <Button
                onClick={() => onConfirmDelete(entry.key)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
              >
                <Check size={14} />
              </Button>
              <Button
                onClick={onCancelDelete}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-surface-2"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onAskDelete(entry.key)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </ScreenHeader>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3 text-[11px]">
          <div>
            <span className="text-muted-foreground">Type:</span>{' '}
            <span className={cn('rounded px-1.5 py-0.5', memoryTypeConfig[entry.type].className)}>
              {memoryTypeConfig[entry.type].label}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Source:</span>{' '}
            <span className="capitalize text-foreground">{entry.source}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Scope:</span>{' '}
            <span className="capitalize text-foreground">{entry.scope}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Size:</span>{' '}
            <span className="font-mono text-foreground">{entry.size}</span>
          </div>
        </div>
        {entry.session || entry.agent ? (
          <div className="flex items-center gap-4 text-[11px]">
            {entry.session ? (
              <span className="flex cursor-pointer items-center gap-1 text-primary hover:underline">
                <ExternalLink size={10} /> {entry.session}
              </span>
            ) : null}
            {entry.agent ? (
              <span className="text-muted-foreground">Agent: {entry.agent}</span>
            ) : null}
          </div>
        ) : null}
        <div className="rounded border border-border bg-surface-2 p-3 text-[13px] leading-relaxed text-foreground">
          {entry.value}
        </div>
        {entry.scope !== 'global' ? (
          <Button
            onClick={() => onConvertToPersistent(entry.key)}
            variant="ghost"
            size="sm"
            className="gap-1.5 px-0 text-[11px] text-primary hover:text-primary/80"
          >
            <Pin size={10} /> Convert to Persistent Memory
          </Button>
        ) : null}
      </div>
    </div>
  );
}
