import { Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { AgentTeam } from './types';

function teamStatusClasses(status: AgentTeam['status']): string {
  switch (status) {
    case 'active':
    case 'assembling':
      return 'bg-primary/20 text-primary';
    case 'paused':
      return 'bg-warning/20 text-warning';
    case 'failed':
    case 'disbanded':
      return 'bg-destructive/20 text-destructive';
    case 'idle':
      return 'bg-muted-foreground/20 text-muted-foreground';
    default:
      return 'bg-green/20 text-green';
  }
}

interface TeamListPaneProps {
  teams: AgentTeam[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

export function TeamListPane({ teams, selectedTeamId, onSelectTeam }: TeamListPaneProps) {
  const { t } = useTranslation();
  return (
    <nav
      className="flex w-[300px] flex-shrink-0 flex-col border-r border-border"
      aria-label={t('ui.agentTeams')}
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 id="team-list-heading" className="text-[13px] font-semibold text-foreground">
          {t('ui.agentTeams')}
        </h2>
        <button
          aria-label={t('ui.createNewTeam')}
          className="flex items-center gap-1 rounded border border-primary px-2 py-1 text-[11px] text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[44px] min-w-[44px]"
        >
          <Plus size={11} aria-hidden="true" />
          {t('ui.newTeam')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" role="listbox" aria-labelledby="team-list-heading">
        {teams.map((team) => (
          <button
            key={team.id}
            role="option"
            aria-selected={selectedTeamId === team.id}
            onClick={() => onSelectTeam(team.id)}
            className={cn(
              'w-full border-b border-border px-3 py-3 text-left transition-colors',
              selectedTeamId === team.id ? 'bg-primary/5' : 'hover:bg-surface-2',
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-foreground">{team.name}</span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[9px] font-mono uppercase',
                  teamStatusClasses(team.status),
                )}
              >
                {team.status}
              </span>
            </div>
            <p className="mb-1.5 line-clamp-1 text-[10px] text-muted-foreground">
              {team.description}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={10} />
                {t('ui.agentsCount', { count: team.agents.length })}
              </span>
              <span className="font-mono">{team.totalTokens}</span>
              <span>
                {t('ui.tasksProgress', { completed: team.completedTasks, total: team.totalTasks })}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(team.completedTasks / team.totalTasks) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
