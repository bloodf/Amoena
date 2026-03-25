import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const shortcutSections: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Cmd', 'K'], description: 'Open command palette' },
      { keys: ['Cmd', 'P'], description: 'Quick file open' },
      { keys: ['Cmd', ','], description: 'Open settings' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Escape'], description: 'Close modal / cancel' },
    ],
  },
  {
    title: 'Session',
    shortcuts: [
      { keys: ['Cmd', 'Enter'], description: 'Send message' },
      { keys: ['Cmd', 'N'], description: 'New session' },
      { keys: ['Cmd', 'Shift', 'A'], description: 'Toggle autopilot' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Cmd', '1-9'], description: 'Switch to screen N' },
      { keys: ['Cmd', '['], description: 'Go back' },
      { keys: ['Cmd', ']'], description: 'Go forward' },
      { keys: ['Tab'], description: 'Move focus forward' },
      { keys: ['Shift', 'Tab'], description: 'Move focus backward' },
    ],
  },
  {
    title: 'Terminal',
    shortcuts: [
      { keys: ['Cmd', '`'], description: 'Toggle terminal' },
      { keys: ['Cmd', 'Shift', '`'], description: 'New terminal tab' },
      { keys: ['Ctrl', 'C'], description: 'Interrupt process' },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-[15px] font-semibold text-foreground">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="flex items-center justify-center rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] min-w-[44px]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {shortcutSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-[13px] text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex min-w-[24px] items-center justify-center rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3 text-center">
          <span className="text-[11px] text-muted-foreground">
            Press{' '}
            <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 font-mono text-[10px]">
              ?
            </kbd>{' '}
            to toggle this help
          </span>
        </div>
      </div>
    </div>
  );
}
