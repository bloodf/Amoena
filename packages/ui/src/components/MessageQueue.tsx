import { useState, useRef } from 'react';
import { GripVertical, X, Clock, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface QueueItem {
  id: string;
  message: string;
  status: 'pending' | 'running' | 'paused';
}

const defaultQueue: QueueItem[] = [
  {
    id: 'q1',
    message: 'Refactor the authentication middleware to use JWT validation',
    status: 'running',
  },
  { id: 'q2', message: 'Add rate limiting to all public API endpoints', status: 'pending' },
  { id: 'q3', message: 'Write integration tests for the WebSocket handler', status: 'pending' },
  { id: 'q4', message: 'Update the CI pipeline to include security scanning', status: 'pending' },
];

const statusConfig = {
  pending: { color: 'bg-muted-foreground', label: 'Queued' },
  running: { color: 'bg-green animate-pulse', label: 'Running' },
  paused: { color: 'bg-warning', label: 'Paused' },
};

export function MessageQueue() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<QueueItem[]>(defaultQueue);
  const [collapsed, setCollapsed] = useState(false);
  const dragItem = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === index) {
      setDropIndex(null);
      return;
    }
    setDropIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dropIndex === null) {
      dragItem.current = null;
      setDropIndex(null);
      return;
    }
    const items = [...queue];
    const dragged = items[dragItem.current];
    items.splice(dragItem.current, 1);
    const insertAt = dropIndex > dragItem.current ? dropIndex - 1 : dropIndex;
    items.splice(insertAt, 0, dragged);
    setQueue(items);
    dragItem.current = null;
    setDropIndex(null);
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const togglePause = (id: string) => {
    setQueue((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        if (q.status === 'running') return { ...q, status: 'paused' as const };
        if (q.status === 'paused') return { ...q, status: 'running' as const };
        return q;
      }),
    );
  };

  if (queue.length === 0) return null;

  return (
    <div className="border-t border-border bg-surface-0">
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand queue' : 'Collapse queue'}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors"
      >
        <Clock size={11} />
        <span>Queue ({queue.length})</span>
        <div className="flex-1" />
        {collapsed ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {!collapsed && (
        <div
          className="px-2 pb-2 max-h-[160px] overflow-y-auto"
          onDragLeave={() => setDropIndex(null)}
        >
          {queue.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Horizontal drop indicator line — above this item */}
              {dropIndex === index && dragItem.current !== null && dragItem.current !== index && (
                <div className="absolute left-2 right-2 top-0 h-[2px] bg-primary z-10 rounded-full" />
              )}
              <div
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-[11px] group transition-colors cursor-grab active:cursor-grabbing mt-0.5',
                  'bg-surface-1 hover:bg-surface-2 border border-transparent hover:border-border',
                  dragItem.current === index && 'opacity-40',
                )}
              >
                <GripVertical size={10} className="text-muted-foreground/50 flex-shrink-0" />
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    statusConfig[item.status].color,
                  )}
                />
                <span className="text-[10px] text-muted-foreground w-4 flex-shrink-0 font-mono">
                  {index + 1}
                </span>
                <span className="flex-1 truncate text-foreground">{item.message}</span>
                <button
                  onClick={() => togglePause(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all"
                  title={item.status === 'running' ? 'Pause' : 'Resume'}
                >
                  {item.status === 'running' ? <Pause size={10} /> : <Play size={10} />}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  title={t('ui.removeQueueItem')}
                  aria-label={t('ui.removeQueueItem')}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
