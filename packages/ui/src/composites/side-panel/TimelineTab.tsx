import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch,
  GitCommit,
  RotateCcw,
  FileCode,
  Plus,
  ChevronRight,
  ChevronDown,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Checkpoint {
  id: string;
  label: string;
  timestamp: string;
  tokensUsed: string;
  filesChanged: number;
  isCurrent: boolean;
  branch?: string;
  children?: Checkpoint[];
}

const timeline: Checkpoint[] = [
  {
    id: 'cp1',
    label: 'Session start',
    timestamp: '3:42 PM',
    tokensUsed: '0',
    filesChanged: 0,
    isCurrent: false,
  },
  {
    id: 'cp2',
    label: 'Initial auth scaffold',
    timestamp: '3:45 PM',
    tokensUsed: '2.1k',
    filesChanged: 4,
    isCurrent: false,
  },
  {
    id: 'cp3',
    label: 'JWT token rotation',
    timestamp: '3:52 PM',
    tokensUsed: '5.8k',
    filesChanged: 3,
    isCurrent: false,
    children: [
      {
        id: 'cp3b',
        label: 'Alt: Session-based auth',
        timestamp: '3:53 PM',
        tokensUsed: '3.2k',
        filesChanged: 2,
        isCurrent: false,
        branch: 'experiment/session-auth',
      },
    ],
  },
  {
    id: 'cp4',
    label: 'Middleware integration',
    timestamp: '3:58 PM',
    tokensUsed: '8.4k',
    filesChanged: 6,
    isCurrent: false,
  },
  {
    id: 'cp5',
    label: 'Error handling + tests',
    timestamp: '4:05 PM',
    tokensUsed: '12.4k',
    filesChanged: 8,
    isCurrent: true,
  },
];

const changedFiles = [
  { path: 'src/auth/jwt.rs', additions: 142, deletions: 23, status: 'modified' as const },
  { path: 'src/auth/middleware.rs', additions: 89, deletions: 0, status: 'added' as const },
  { path: 'src/auth/mod.rs', additions: 12, deletions: 4, status: 'modified' as const },
  { path: 'tests/auth_test.rs', additions: 156, deletions: 0, status: 'added' as const },
];

const diffLines = [
  { type: 'context', line: 14, content: 'use jsonwebtoken::{encode, decode, Header, Algorithm};' },
  { type: 'context', line: 15, content: 'use chrono::{Utc, Duration};' },
  { type: 'deletion', line: 16, content: 'const TOKEN_EXPIRY: i64 = 3600; // 1 hour' },
  { type: 'addition', line: 16, content: 'const ACCESS_TOKEN_EXPIRY: i64 = 900;  // 15 minutes' },
  { type: 'addition', line: 17, content: 'const REFRESH_TOKEN_EXPIRY: i64 = 604800; // 7 days' },
  { type: 'context', line: 18, content: '' },
  { type: 'deletion', line: 19, content: 'pub fn create_token(user_id: &str) -> Result<String> {' },
  {
    type: 'addition',
    line: 19,
    content: 'pub fn create_token_pair(user_id: &str) -> Result<TokenPair> {',
  },
  { type: 'addition', line: 20, content: '    let access = create_access_token(user_id)?;' },
  { type: 'addition', line: 21, content: '    let refresh = create_refresh_token(user_id)?;' },
  { type: 'addition', line: 22, content: '    Ok(TokenPair { access, refresh })' },
  { type: 'context', line: 23, content: '}' },
];

export function TimelineTab() {
  const { t } = useTranslation();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('cp5');
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);

  const selectedCp =
    timeline.find((t) => t.id === selectedCheckpoint) ||
    timeline.flatMap((t) => t.children || []).find((c) => c.id === selectedCheckpoint);

  const renderCheckpoint = (cp: Checkpoint, depth = 0) => {
    const isSelected = selectedCheckpoint === cp.id;
    return (
      <div key={cp.id}>
        <div className={cn('flex items-start gap-2', depth > 0 && 'ml-5')}>
          <div className="flex flex-col items-center flex-shrink-0 pt-1">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full border-2 transition-all flex-shrink-0',
                (() => {
                  if (cp.isCurrent) {
                    return 'border-primary bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]';
                  }
                  if (isSelected) {
                    return 'border-primary/60 bg-primary/30';
                  }
                  if (depth > 0) {
                    return 'border-purple/60 bg-purple/20';
                  }
                  return 'border-border bg-surface-2';
                })(),
              )}
            />
            <div className="w-px flex-1 bg-border min-h-[16px]" />
          </div>

          <button
            onClick={() => setSelectedCheckpoint(cp.id)}
            className={cn(
              'flex-1 text-left px-2 py-1.5 rounded border transition-all mb-0.5 min-w-0',
              isSelected
                ? 'border-primary/30 bg-primary/5'
                : 'border-transparent hover:bg-surface-2',
            )}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {cp.branch && (
                  <span className="flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded bg-purple/20 text-purple font-mono flex-shrink-0">
                    <GitBranch size={7} />
                    {cp.branch.length > 16 ? `${cp.branch.slice(0, 16)}…` : cp.branch}
                  </span>
                )}
                <span
                  className={cn(
                    'text-[11px] font-medium truncate',
                    cp.isCurrent ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {cp.label}
                  {cp.isCurrent && (
                    <span className="text-[8px] text-primary ml-1 flex items-center gap-0.5">
                      <Circle size={5} className="fill-primary text-primary" /> now
                    </span>
                  )}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0 ml-1">
                {cp.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="font-mono">{cp.tokensUsed} tok</span>
              {cp.filesChanged > 0 && (
                <span className="flex items-center gap-0.5">
                  <FileCode size={8} />
                  {cp.filesChanged}
                </span>
              )}
            </div>
          </button>

          {isSelected && !cp.isCurrent && (
            <div className="flex items-center gap-0.5 pt-1.5 flex-shrink-0">
              <button
                className="p-1 text-muted-foreground cursor-pointer hover:text-primary hover:bg-primary/10 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                aria-label={t('ui.restoreCheckpoint')}
              >
                <RotateCcw size={10} />
              </button>
              <button
                className="p-1 text-muted-foreground cursor-pointer hover:text-purple hover:bg-purple/10 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                aria-label={t('ui.forkFromCheckpoint')}
              >
                <GitBranch size={10} />
              </button>
            </div>
          )}
        </div>
        {cp.children?.map((child) => renderCheckpoint(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <GitCommit size={12} className="text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Timeline</span>
        </div>
        <button className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] border border-border text-muted-foreground rounded cursor-pointer hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
          <Plus size={9} /> Checkpoint
        </button>
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-y-auto p-2">{timeline.map((cp) => renderCheckpoint(cp))}</div>

      {/* Selected checkpoint detail */}
      {selectedCp && selectedCp.filesChanged > 0 && (
        <div className="border-t border-border flex-shrink-0 max-h-[45%] overflow-y-auto">
          <div className="px-2.5 py-2">
            <div className="text-[10px] font-medium text-foreground mb-0.5">{selectedCp.label}</div>
            <div className="text-[9px] text-muted-foreground mb-2">
              {selectedCp.filesChanged} files · {selectedCp.timestamp}
            </div>

            {/* Changed files */}
            <div className="space-y-0.5">
              {changedFiles.map((file) => (
                <div key={file.path}>
                  <button
                    onClick={() => setExpandedDiff(expandedDiff === file.path ? null : file.path)}
                    className="flex items-center w-full py-1 px-1.5 rounded hover:bg-surface-2 transition-colors text-left"
                  >
                    {expandedDiff === file.path ? (
                      <ChevronDown size={9} className="text-muted-foreground mr-1" />
                    ) : (
                      <ChevronRight size={9} className="text-muted-foreground mr-1" />
                    )}
                    <FileCode
                      size={10}
                      className={cn(
                        'flex-shrink-0 mr-1.5',
                        file.status === 'added' ? 'text-green' : 'text-warning',
                      )}
                    />
                    <span className="text-[10px] font-mono text-foreground flex-1 truncate">
                      {file.path}
                    </span>
                    <span className="text-[9px] font-mono text-green mr-1">+{file.additions}</span>
                    {file.deletions > 0 && (
                      <span className="text-[9px] font-mono text-destructive">
                        -{file.deletions}
                      </span>
                    )}
                  </button>

                  {/* Inline diff */}
                  {expandedDiff === file.path && (
                    <div className="ml-4 mt-0.5 mb-1 border border-border rounded overflow-hidden text-[9px] font-mono leading-[1.5]">
                      {diffLines.map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex',
                            line.type === 'addition' && 'bg-green/10',
                            line.type === 'deletion' && 'bg-destructive/10',
                          )}
                        >
                          <span className="w-6 text-right pr-1 text-muted-foreground/40 select-none border-r border-border">
                            {line.line}
                          </span>
                          {(() => {
                            let markerColor = 'text-muted-foreground/30';
                            let markerChar = ' ';
                            let contentColor = 'text-foreground';
                            if (line.type === 'addition') {
                              markerColor = 'text-green';
                              markerChar = '+';
                              contentColor = 'text-green';
                            } else if (line.type === 'deletion') {
                              markerColor = 'text-destructive';
                              markerChar = '-';
                              contentColor = 'text-destructive';
                            }
                            return (
                              <>
                                <span className={cn('px-1 w-3 select-none', markerColor)}>
                                  {markerChar}
                                </span>
                                <span className={cn('flex-1 truncate', contentColor)}>
                                  {line.content}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
