import { useState, useRef } from 'react';
import { X, Plus, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils.ts';

interface TerminalTab {
  id: string;
  label: string;
  active: boolean;
  hasProcess: boolean;
  processLabel?: string;
}

export function TerminalPanel({
  onClose,
  output,
  onInput,
}: {
  onClose: () => void;
  output?: string;
  onInput?: (data: string) => void;
}) {
  const { t } = useTranslation();
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', label: 'bash', active: true, hasProcess: false },
    { id: '2', label: 'node', active: false, hasProcess: true, processLabel: 'cargo build' },
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const dragItem = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const addTab = () => {
    const newId = String(Date.now());
    setTabs((prev) => [...prev, { id: newId, label: 'bash', active: false, hasProcess: false }]);
    setActiveTab(newId);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[0].id);
  };

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
    const items = [...tabs];
    const dragged = items[dragItem.current];
    items.splice(dragItem.current, 1);
    const insertAt = dropIndex > dragItem.current ? dropIndex - 1 : dropIndex;
    items.splice(insertAt, 0, dragged);
    setTabs(items);
    dragItem.current = null;
    setDropIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <div className="flex items-center h-7 border-b border-border px-2 flex-shrink-0">
        <div
          className="flex items-center gap-0.5 flex-1 overflow-x-auto"
          onDragLeave={() => setDropIndex(null)}
        >
          {tabs.map((tab, index) => (
            <div key={tab.id} className="relative">
              {dropIndex === index && dragItem.current !== null && dragItem.current !== index && (
                <div className="absolute left-0 top-0.5 bottom-0.5 w-[2px] bg-primary z-10 rounded-full" />
              )}
              <button
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-sm transition-colors cursor-grab active:cursor-grabbing',
                  activeTab === tab.id
                    ? 'text-foreground bg-surface-2'
                    : 'text-muted-foreground hover:text-foreground',
                  dragItem.current === index && 'opacity-40',
                )}
              >
                {tab.hasProcess && (
                  <Circle size={5} className="fill-green text-green animate-pulse" />
                )}
                <span>{tab.label}</span>
                {tab.hasProcess && tab.processLabel && (
                  <span className="text-[9px] text-muted-foreground">({tab.processLabel})</span>
                )}
                {tabs.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => closeTab(tab.id, e as unknown as React.MouseEvent)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        closeTab(tab.id, e as unknown as React.MouseEvent);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 ml-0.5"
                  >
                    <X size={9} />
                  </span>
                )}
              </button>
            </div>
          ))}
          <button
            onClick={addTab}
            aria-label={t('ui.addTerminalTab')}
            className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
        <button
          aria-label={t('ui.closeTerminalPanel')}
          onClick={onClose}
          className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={11} />
        </button>
      </div>
      <div
        className="flex-1 p-2 overflow-y-auto font-mono text-[13px] focus:outline-none focus:ring-1 focus:ring-primary/30"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!onInput) return;
          if (e.key === 'Enter') {
            onInput('\r');
            e.preventDefault();
          } else if (e.key === 'Backspace') {
            onInput('\x7f');
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            onInput('\x1b[A');
            e.preventDefault();
          } else if (e.key === 'ArrowDown') {
            onInput('\x1b[B');
            e.preventDefault();
          } else if (e.key === 'ArrowRight') {
            onInput('\x1b[C');
            e.preventDefault();
          } else if (e.key === 'ArrowLeft') {
            onInput('\x1b[D');
            e.preventDefault();
          } else if (e.key === 'Tab') {
            onInput('\t');
            e.preventDefault();
          } else if (e.key === 'c' && e.ctrlKey) {
            onInput('\x03');
            e.preventDefault();
          } else if (e.key === 'd' && e.ctrlKey) {
            onInput('\x04');
            e.preventDefault();
          } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            onInput(e.key);
          }
        }}
      >
        {output ? (
          <pre className="whitespace-pre-wrap text-foreground">
            {output}
            <span className="animate-pulse">▋</span>
          </pre>
        ) : (
          <div className="text-muted-foreground">
            <span className="text-green">❯</span> <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}
