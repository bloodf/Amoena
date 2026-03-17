import * as React from 'react';
import { ChevronDown, GitBranch, Plus, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderLogo } from '../shared/ProviderLogo';
import type { ComposerOption, ComposerPermissionOption, ComposerReasoningLevel } from './types';
import {
  ComposerActionsMenu,
  ComposerAgentMenu,
  ComposerBranchMenu,
  ComposerContinueMenu,
  ComposerModelMenu,
  ComposerPermissionMenu,
  ComposerReasoningMenu,
} from './ComposerMenus';

interface ComposerDropdownProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ComposerDropdown({ open, onClose, children, className }: ComposerDropdownProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-30 overflow-hidden rounded-lg border border-border bg-surface-1 shadow-2xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ComposerToolbarProps {
  providerName: string;
  activeProvider: string;
  activeAgentName: string;
  activeAgentColor: string;
  activeAgentRole: string;
  agents: { id: string; name: string; role: string; color: string }[];
  activeAgentId: string;
  models: { id: string; label: string }[];
  activeModelId: string;
  activeModelLabel: string;
  reasoningLevel: string;
  reasoningLevels: ComposerReasoningLevel[];
  continueOptions: ComposerOption[];
  permissionOptions: ComposerPermissionOption[];
  branchOptions: string[];
  session?: { continueIn: 'local' | 'worktree' | 'cloud'; permission: string; branch: string };
  planMode: boolean;
  menus: {
    plus: boolean;
    agent: boolean;
    model: boolean;
    reasoning: boolean;
    continueIn: boolean;
    permission: boolean;
    branch: boolean;
  };
  onToggleMenu: (menu: keyof ComposerToolbarProps['menus']) => void;
  onCloseMenu: (menu: keyof ComposerToolbarProps['menus']) => void;
  onTogglePlanMode: () => void;
  onSelectAgent: (id: string) => void;
  onSelectModel: (id: string) => void;
  onSelectReasoning: (id: string) => void;
  onSelectContinueIn: (id: 'local' | 'worktree' | 'cloud') => void;
  onSelectPermission: (id: string) => void;
  onSelectBranch: (branch: string) => void;
}

export function ComposerToolbar({
  providerName,
  activeProvider,
  activeAgentName,
  activeAgentColor,
  activeAgentRole: _activeAgentRole,
  agents,
  activeAgentId,
  models,
  activeModelId,
  activeModelLabel,
  reasoningLevel,
  reasoningLevels,
  continueOptions,
  permissionOptions,
  branchOptions,
  session,
  planMode,
  menus,
  onToggleMenu,
  onCloseMenu,
  onTogglePlanMode,
  onSelectAgent,
  onSelectModel,
  onSelectReasoning,
  onSelectContinueIn,
  onSelectPermission,
  onSelectBranch,
}: ComposerToolbarProps) {
  const ContinueIcon = continueOptions.find((option) => option.id === session?.continueIn)?.icon;

  return (
    <div className="relative flex flex-wrap items-center gap-0.5 px-2 pb-2">
      <div className="relative">
        <button
          aria-label="Open composer actions"
          onClick={() => onToggleMenu('plus')}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Plus size={15} />
        </button>
        <ComposerActionsMenu
          open={menus.plus}
          onClose={() => onCloseMenu('plus')}
          planMode={planMode}
          onTogglePlanMode={onTogglePlanMode}
        />
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex h-7 items-center gap-1.5 rounded px-1.5 font-mono text-[11px] text-muted-foreground">
        <ProviderLogo provider={activeProvider} size={14} />
        <span className="hidden sm:inline">{providerName}</span>
      </div>

      <div className="relative">
        <button
          aria-label="Open agent picker"
          onClick={() => onToggleMenu('agent')}
          className="flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[11px] transition-colors hover:bg-surface-2"
        >
          <span className={cn('font-semibold', activeAgentColor)}>{activeAgentName}</span>
          <ChevronDown size={9} className="text-muted-foreground" />
        </button>
        <ComposerAgentMenu
          open={menus.agent}
          onClose={() => onCloseMenu('agent')}
          agents={agents}
          activeAgentId={activeAgentId}
          onSelectAgent={onSelectAgent}
        />
      </div>

      <div className="relative">
        <button
          aria-label="Open model picker"
          onClick={() => onToggleMenu('model')}
          className="flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Zap size={10} className="text-primary" />
          <span className="hidden sm:inline">{activeModelLabel}</span>
          <ChevronDown size={9} />
        </button>
        <ComposerModelMenu
          open={menus.model}
          onClose={() => onCloseMenu('model')}
          models={models}
          activeModelId={activeModelId}
          onSelectModel={onSelectModel}
        />
      </div>

      <div className="relative">
        <button
          aria-label="Open reasoning picker"
          onClick={() => onToggleMenu('reasoning')}
          className={cn(
            'flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[10px] transition-colors hover:bg-surface-2',
            reasoningLevel === 'high' || reasoningLevel === 'extra-high'
              ? 'text-warning'
              : 'text-muted-foreground',
          )}
        >
          {reasoningLevel}
          <ChevronDown size={9} />
        </button>
        <ComposerReasoningMenu
          open={menus.reasoning}
          onClose={() => onCloseMenu('reasoning')}
          reasoningLevels={reasoningLevels}
          reasoningLevel={reasoningLevel}
          onSelectReasoning={onSelectReasoning}
        />
      </div>

      <div className="h-4 w-px bg-border" />

      {session ? (
        <>
          <div className="relative">
            <button
              aria-label="Open work target picker"
              onClick={() => onToggleMenu('continueIn')}
              className="flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {ContinueIcon ? <ContinueIcon size={10} /> : null}
              <span className="hidden sm:inline">
                {continueOptions.find((option) => option.id === session.continueIn)?.label}
              </span>
              <ChevronDown size={9} />
            </button>
            <ComposerContinueMenu
              open={menus.continueIn}
              onClose={() => onCloseMenu('continueIn')}
              options={continueOptions}
              current={session.continueIn}
              onSelect={onSelectContinueIn}
            />
          </div>

          <div className="relative">
            <button
              aria-label="Open permission picker"
              onClick={() => onToggleMenu('permission')}
              className={cn(
                'flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[10px] transition-colors',
                session.permission === 'full'
                  ? 'text-warning hover:bg-warning/10'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )}
            >
              <Shield size={10} />
              <span className="hidden sm:inline">
                {permissionOptions.find((option) => option.id === session.permission)?.label}
              </span>
              <ChevronDown size={9} />
            </button>
            <ComposerPermissionMenu
              open={menus.permission}
              onClose={() => onCloseMenu('permission')}
              options={permissionOptions}
              current={session.permission}
              onSelect={onSelectPermission}
            />
          </div>

          <div className="relative">
            <button
              aria-label="Open branch picker"
              onClick={() => onToggleMenu('branch')}
              className="flex h-7 items-center gap-1 rounded px-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <GitBranch size={10} />
              <span className="hidden max-w-[100px] truncate sm:inline">{session.branch}</span>
              <ChevronDown size={9} />
            </button>
            <ComposerBranchMenu
              open={menus.branch}
              onClose={() => onCloseMenu('branch')}
              branchOptions={branchOptions}
              current={session.branch}
              onSelect={onSelectBranch}
            />
          </div>
        </>
      ) : null}

      <div className="flex-1" />
      {planMode ? (
        <span className="flex-shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">
          PLAN
        </span>
      ) : null}
    </div>
  );
}
