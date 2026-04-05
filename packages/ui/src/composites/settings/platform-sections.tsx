import { Palette, Plus, Puzzle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from '@/components/settings-controls';
import { installedPlugins, installedThemes, keybindings } from './data';

export function PluginsSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {installedPlugins.length} {t('ui.installed')}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-primary px-3 py-1.5 text-[12px] text-primary transition-colors hover:bg-primary/10"
        >
          <Plus size={12} /> {t('ui.browseMarketplace')}
        </button>
      </div>

      {installedPlugins.map((plugin) => (
        <div key={plugin.name} className="mb-2 rounded border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle size={14} className="text-muted-foreground" />
              <span className="text-[13px] font-medium text-foreground">{plugin.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">v{plugin.version}</span>
              {plugin.updateAvailable ? (
                <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] text-primary">
                  {t('ui.updateAvailable')}
                </span>
              ) : null}
            </div>
            <SettingsToggle on={plugin.enabled} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>
              {t('ui.by')} {plugin.author}
            </span>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[9px]',
                plugin.trusted ? 'bg-green/20 text-green' : 'bg-warning/20 text-warning',
              )}
            >
              {plugin.trusted ? t('ui.trusted') : t('ui.unverified')}
            </span>
            <span>
              {t('ui.permissions')}: {plugin.permissions.join(', ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThemesSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.activeTheme')} />
      {installedThemes.map((theme) => (
        <div
          key={theme.name}
          className={cn(
            'mb-1 flex items-center justify-between rounded border px-3 py-3 transition-colors',
            theme.active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
          )}
        >
          <div className="flex items-center gap-3">
            <Palette
              size={14}
              className={theme.active ? 'text-primary' : 'text-muted-foreground'}
            />
            <div>
              <div className="text-[13px] text-foreground">{theme.name}</div>
              <div className="text-[10px] text-muted-foreground">{theme.author}</div>
            </div>
          </div>
          {theme.active ? (
            <span className="font-mono text-[10px] text-primary">{t('ui.active')}</span>
          ) : (
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              {t('ui.activate')}
            </button>
          )}
        </div>
      ))}

      <SettingsSectionTitle title={t('ui.customization')} />
      <SettingsRow
        label={t('ui.accentColor')}
        description={t('ui.primaryAccentColorThroughoutTheUI')}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border border-border bg-primary" />
          <SettingsSelect
            options={[
              { value: 'magenta', label: t('ui.colorMagenta') },
              { value: 'purple', label: t('ui.colorPurple') },
              { value: 'blue', label: t('ui.colorBlue') },
              { value: 'teal', label: t('ui.colorTeal') },
              { value: 'orange', label: t('ui.colorOrange') },
              { value: 'rose', label: t('ui.colorRose') },
            ]}
          />
        </div>
      </SettingsRow>
      <SettingsRow
        label={t('ui.uiDensity')}
        description={t('ui.spacingDensityOfInterfaceElements')}
      >
        <SettingsSelect
          options={[
            { value: 'comfortable', label: t('ui.comfortable') },
            { value: 'compact', label: t('ui.compact') },
            { value: 'spacious', label: t('ui.spacious') },
          ]}
        />
      </SettingsRow>
    </div>
  );
}

export function KeybindingsSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SettingsRow label={t('ui.preset')} description={t('ui.keyboardShortcutPreset')}>
          <SettingsSelect
            options={[
              { value: 'default', label: 'Default' },
              { value: 'vim', label: 'Vim' },
              { value: 'emacs', label: 'Emacs' },
              { value: 'vscode', label: 'VS Code' },
              { value: 'jetbrains', label: 'JetBrains' },
            ]}
          />
        </SettingsRow>
      </div>

      <SettingsSectionTitle title={t('ui.shortcuts')} />
      <div className="overflow-hidden rounded border border-border">
        <div className="grid grid-cols-[1fr_100px_120px] border-b border-border bg-surface-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{t('ui.action')}</span>
          <span>{t('ui.category')}</span>
          <span>{t('ui.binding')}</span>
        </div>
        {keybindings.map((keybinding, index) => (
          <div
            key={keybinding.action}
            className={cn(
              'grid grid-cols-[1fr_100px_120px] items-center px-3 py-2 transition-colors hover:bg-surface-2',
              index > 0 && 'border-t border-border',
            )}
          >
            <span className="text-[12px] text-foreground">{keybinding.action}</span>
            <span className="text-[11px] text-muted-foreground">{keybinding.category}</span>
            <kbd className="w-fit rounded border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-foreground">
              {keybinding.binding}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationsSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.toastBehavior')} />
      <SettingsRow
        label={t('ui.showToastNotifications')}
        description={t('ui.displayNonBlockingNotifications')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label={t('ui.toastDuration')} description={t('ui.howLongToastsRemainVisible')}>
        <SettingsSelect
          options={[
            { value: '3', label: '3 seconds' },
            { value: '5', label: '5 seconds' },
            { value: '10', label: '10 seconds' },
            { value: 'dismissed', label: t('ui.untilDismissed') },
          ]}
          defaultValue="5"
        />
      </SettingsRow>
      <SettingsRow label={t('ui.toastPosition')}>
        <SettingsSelect
          options={[
            { value: 'bottomRight', label: t('ui.bottomRight') },
            { value: 'bottomLeft', label: t('ui.bottomLeft') },
            { value: 'topRight', label: t('ui.topRight') },
            { value: 'topCenter', label: t('ui.topCenter') },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.alerts')} />
      <SettingsRow
        label={t('ui.criticalAlerts')}
        description={t('ui.permissionRequestsErrorsAndRateLimitWarnings')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.backgroundTaskCompletion')}
        description={t('ui.notifyWhenBackgroundTasksFinish')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label={t('ui.soundEffects')} description={t('ui.playSoundsForNotifications')}>
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.remote')} />
      <SettingsRow
        label={t('ui.remoteApprovalNotifications')}
        description={t('ui.notifyWhenRemoteDeviceRequestsApproval')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.mobilePushNotifications')}
        description={t('ui.sendPushNotificationsToConnectedMobileApp')}
      >
        <SettingsToggle />
      </SettingsRow>
    </div>
  );
}

export function WorkspaceSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.worktree')} />
      <SettingsRow
        label={t('ui.defaultWorktreeLocation')}
        description={t('ui.whereNewWorktreesAreCreated')}
      >
        <input
          defaultValue="~/.amoena/worktrees"
          className="w-48 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground"
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.autoCreateWorktree')}
        description={t('ui.createWorktreeAutomaticallyForNewBranches')}
      >
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.clone')} />
      <SettingsRow label={t('ui.cloneStrategy')} description={t('ui.howRepositoriesAreCloned')}>
        <SettingsSelect
          options={[
            { value: 'full', label: 'Full clone' },
            { value: 'shallow', label: 'Shallow clone (depth 1)' },
            { value: 'blobless', label: 'Blobless clone' },
            { value: 'treeless', label: 'Treeless clone' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultBranch')}>
        <input
          defaultValue="main"
          className="w-24 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground"
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.mergeReview')} />
      <SettingsRow
        label={t('ui.mergeReviewBehavior')}
        description={t('ui.howChangesAreReviewedBeforeApplyingBack')}
      >
        <SettingsSelect
          options={[
            { value: 'alwaysRequireReview', label: t('ui.alwaysRequireReview') },
            { value: 'autoMerge', label: t('ui.autoMergeIfNoConflicts') },
            { value: 'manualOnly', label: t('ui.manualOnly') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.autoCleanup')}
        description={t('ui.deleteWorktreesAfterSuccessfulMerge')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.cleanupAfterDays')}
        description={t('ui.autoDeleteUnusedWorktreesAfterThisManyDays')}
      >
        <SettingsNumberInput defaultValue={7} />
      </SettingsRow>
    </div>
  );
}
