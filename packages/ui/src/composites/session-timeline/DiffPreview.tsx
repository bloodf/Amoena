import { cn } from '../../lib/utils.ts';

export function DiffPreview({
  lines,
}: {
  lines: readonly { type: string; line: number; content: string }[];
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-2">
        <span className="font-mono text-[11px] text-foreground">src/auth/jwt.rs</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-green">+142</span>
          <span className="font-mono text-[10px] text-destructive">-23</span>
        </div>
      </div>
      <div className="font-mono text-[11px] leading-[1.6]">
        {lines.map((line, index) => (
          <div
            key={index}
            className={cn(
              'flex',
              line.type === 'addition' && 'bg-green/10',
              line.type === 'deletion' && 'bg-destructive/10',
            )}
          >
            <span className="w-10 select-none border-r border-border pr-2 text-right text-muted-foreground/50">
              {line.line}
            </span>
            <span
              className={cn(
                'w-4 select-none px-2',
                (() => {
                  if (line.type === 'addition') return 'text-green';
                  if (line.type === 'deletion') return 'text-destructive';
                  return 'text-muted-foreground/30';
                })(),
              )}
            >
              {(() => {
                if (line.type === 'addition') return '+';
                if (line.type === 'deletion') return '-';
                return ' ';
              })()}
            </span>
            <span
              className={cn(
                'flex-1',
                (() => {
                  if (line.type === 'addition') return 'text-green';
                  if (line.type === 'deletion') return 'text-destructive';
                  return 'text-foreground';
                })(),
              )}
            >
              {line.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
