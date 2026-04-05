import { X, Trash2, Play, Pause, Square, StopCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { AgentStatus, ManagedAgent } from './types';
import { divisionColors, divisionLabels, managedStatusConfig, sourceColors } from './config';

interface AgentDetailSheetProps {
  agent: ManagedAgent;
  onClose: () => void;
  onStatusChange: (status: AgentStatus) => void;
  onPermissionChange: (permission: string) => void;
  onDelete: () => void;
}

export function AgentDetailSheet({
  agent,
  onClose,
  onStatusChange,
  onPermissionChange,
  onDelete,
}: AgentDetailSheetProps) {
  const { t } = useTranslation();
  const status = managedStatusConfig[agent.status];
  const divisionColor = agent.division ? divisionColors[agent.division] : undefined;
  const divisionLabel = agent.division ? divisionLabels[agent.division] : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-lg border border-border bg-surface-1 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">Agent Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            aria-label={t('ui.closeAgentSettings')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full', status.color)} />
            <div>
              <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                {agent.emoji && <span>{agent.emoji}</span>}
                {agent.name}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {agent.provider} · {agent.model}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground">{agent.role}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Source</span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-mono',
                  sourceColors[agent.source],
                )}
              >
                {agent.source}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Tools</span>
              <span className="text-[11px] font-mono text-foreground">
                {agent.tools.join(', ')}
              </span>
            </div>
            {agent.session && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Session</span>
                <span className="text-foreground">{agent.session}</span>
              </div>
            )}
            {agent.mailbox.count > 0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Mailbox</span>
                <span className="text-primary">{agent.mailbox.count} messages</span>
              </div>
            )}
          </div>

          {(agent.division ||
            agent.collaborationStyle ||
            agent.communicationPreference ||
            agent.decisionWeight !== undefined ||
            agent.vibe) && (
            <div className="space-y-2 rounded-md border border-border bg-surface-2 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Collaboration Profile
              </div>
              {divisionLabel && divisionColor && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Division</span>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${divisionColor}20`, color: divisionColor }}
                  >
                    {divisionLabel}
                  </span>
                </div>
              )}
              {agent.collaborationStyle && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Collaboration Style</span>
                  <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] text-foreground capitalize">
                    {agent.collaborationStyle}
                  </span>
                </div>
              )}
              {agent.communicationPreference && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Communication</span>
                  <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] text-foreground capitalize">
                    {agent.communicationPreference}
                  </span>
                </div>
              )}
              {agent.decisionWeight !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Decision Weight</span>
                    <span className="text-[10px] font-mono text-foreground">
                      {Math.round(agent.decisionWeight * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-3">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${agent.decisionWeight * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {agent.vibe && (
                <div className="pt-1 text-[11px] italic text-muted-foreground">
                  &ldquo;{agent.vibe}&rdquo;
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Strengths
                  </div>
                  {agent.strengths?.length ? (
                    agent.strengths.map((strength) => (
                      <div
                        key={strength}
                        className="rounded bg-surface-3 px-2 py-1 text-[10px] text-foreground"
                      >
                        {strength}
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-muted-foreground">No strengths recorded</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Limitations
                  </div>
                  {agent.limitations?.length ? (
                    agent.limitations.map((limitation) => (
                      <div
                        key={limitation}
                        className="rounded bg-surface-3 px-2 py-1 text-[10px] text-foreground"
                      >
                        {limitation}
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-muted-foreground">No limitations recorded</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Permission
            </label>
            <select
              value={agent.permission}
              onChange={(event) => onPermissionChange(event.target.value)}
              className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            >
              <option>Full access</option>
              <option>Default</option>
              <option>Read only</option>
              <option>Plan only</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Status Control
            </label>
            <div className="flex items-center gap-2">
              {(agent.status === 'idle' ||
                agent.status === 'created' ||
                agent.status === 'paused' ||
                agent.status === 'stopped' ||
                agent.status === 'failed' ||
                agent.status === 'cancelled') && (
                <button
                  onClick={() => onStatusChange('active')}
                  className="flex items-center gap-1.5 rounded bg-green/20 px-3 py-1.5 text-[12px] text-green cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-green/30"
                >
                  <Play size={12} /> Activate
                </button>
              )}
              {(agent.status === 'active' || agent.status === 'running') && (
                <button
                  onClick={() => onStatusChange('paused')}
                  className="flex items-center gap-1.5 rounded bg-warning/20 px-3 py-1.5 text-[12px] text-warning cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-warning/30"
                >
                  <Pause size={12} /> Pause
                </button>
              )}
              {(agent.status === 'active' ||
                agent.status === 'running' ||
                agent.status === 'paused') && (
                <button
                  onClick={() => onStatusChange('stopped')}
                  className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-surface-2"
                >
                  <StopCircle size={12} /> Stop
                </button>
              )}
              {agent.status === 'preparing' && (
                <button
                  onClick={() => onStatusChange('cancelled')}
                  className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-surface-2"
                >
                  <Square size={12} /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded border border-destructive/40 px-3 py-1.5 text-[12px] text-destructive cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-destructive/10"
          >
            <Trash2 size={12} /> Remove Agent
          </button>
          <button
            onClick={onClose}
            className="rounded bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
