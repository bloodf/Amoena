import { Circle, GripVertical, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils.ts';
import type { KanbanTask } from './types';

const priorityColors: Record<KanbanTask['priority'], string> = {
  low: 'bg-muted-foreground/20 text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

export function KanbanTaskCard({
  task,
  isDragging,
  onDragStart,
}: {
  task: KanbanTask;
  isDragging: boolean;
  onDragStart: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'group bg-surface-1 border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={12}
          className="text-muted-foreground/40 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-medium text-foreground leading-snug">
              {task.title}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
              aria-label={t('ui.taskOptions')}
            >
              <MoreHorizontal size={12} />
            </button>
          </div>
          {task.description && (
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-[9px] px-1.5 py-0.5 rounded font-medium',
                priorityColors[task.priority],
              )}
            >
              {task.priority}
            </span>
            {task.agent && (
              <div className="flex items-center gap-1">
                <Circle
                  size={5}
                  className={cn(
                    'fill-current',
                    task.agentColor === 'tui-claude' && 'text-tui-claude',
                    task.agentColor === 'tui-opencode' && 'text-tui-opencode',
                    task.agentColor === 'tui-gemini' && 'text-tui-gemini',
                  )}
                />
                <span className="text-[10px] text-muted-foreground">{task.agent}</span>
              </div>
            )}
            {task.tokens && (
              <span className="text-[10px] font-mono text-muted-foreground">{task.tokens}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
