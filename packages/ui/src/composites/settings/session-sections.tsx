import {
  SettingsInfoBanner,
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from '../../components/settings-controls.tsx';
import { useTranslation } from 'react-i18next';

export function SessionSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.defaults')} />
      <SettingsRow label={t('ui.defaultModel')} description={t('ui.modelUsedForNewSessions')}>
        <SettingsSelect
          options={[
            { value: 'sonnet', label: 'Claude 4 Sonnet' },
            { value: 'opus', label: 'Claude 4 Opus' },
            { value: 'gpt', label: 'GPT-5.4' },
            { value: 'gemini', label: 'Gemini 2.5 Pro' },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.defaultReasoningMode')}
        description={t('ui.reasoningBehaviorForNewSessions')}
      >
        <SettingsSelect
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'on', label: t('ui.alwaysOn') },
            { value: 'off', label: 'Off' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultReasoningDepth')}>
        <SettingsSelect
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'extra', label: t('ui.extraHigh') },
          ]}
          defaultValue="high"
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultPermissionPreset')}>
        <SettingsSelect
          options={[
            { value: 'ask', label: t('ui.defaultAskBeforeRisky') },
            { value: 'full', label: t('ui.fullAccess') },
            { value: 'plan', label: t('ui.planOnly') },
            { value: 'read', label: t('ui.readOnly') },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultWorkTarget')}>
        <SettingsSelect
          options={[
            { value: 'local', label: t('ui.localProject') },
            { value: 'worktree', label: t('ui.newWorktree') },
            { value: 'cloud', label: t('ui.cloud') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.defaultReasoningMode')}
        description={t('ui.reasoningBehaviorForNewSessions')}
      >
        <SettingsSelect
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'on', label: t('ui.alwaysOn') },
            { value: 'off', label: 'Off' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultReasoningDepth')}>
        <SettingsSelect
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'extra', label: t('ui.extraHigh') },
          ]}
          defaultValue="High"
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultPermissionPreset')}>
        <SettingsSelect
          options={[
            { value: 'ask', label: t('ui.defaultAskBeforeRisky') },
            { value: 'full', label: t('ui.fullAccess') },
            { value: 'plan', label: t('ui.planOnly') },
            { value: 'read', label: t('ui.readOnly') },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.defaultWorkTarget')}>
        <SettingsSelect
          options={[
            { value: 'local', label: t('ui.localProject') },
            { value: 'worktree', label: t('ui.newWorktree') },
            { value: 'cloud', label: t('ui.cloud') },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.newSessionBehavior')} />
      <SettingsRow
        label={t('ui.autoIncludeOpenFiles')}
        description={t('ui.attachOpenEditorFilesToNewSessions')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.includeIDEContext')}
        description={t('ui.passEditorSelectionAndOpenTabs')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.maxContextTokens')}
        description={t('ui.softLimitForContextInjection')}
      >
        <SettingsNumberInput defaultValue={32000} width="w-20" />
      </SettingsRow>
    </div>
  );
}

export function MemorySettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.observation')} />
      <SettingsRow
        label={t('ui.observationRetention')}
        description={t('ui.howLongAutoCapturedObservationsAreKept')}
      >
        <SettingsSelect
          options={[
            { value: 'session', label: t('ui.sessionOnly') },
            { value: '7', label: t('ui.sevenDays') },
            { value: '30', label: t('ui.thirtyDays') },
            { value: 'forever', label: t('ui.forever') },
          ]}
          defaultValue="30"
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.autoSummarizeSessions')}
        description={t('ui.generateMemorySummariesAfterSessionsEnd')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.summaryGenerationModel')}
        description={t('ui.modelUsedForMemorySummarization')}
      >
        <SettingsSelect
          options={[
            { value: 'same', label: 'Same as session' },
            { value: 'haiku', label: 'Claude 4 Haiku' },
            { value: 'gpt', label: 'GPT-5.3-Codex-Spark' },
            { value: 'flash', label: 'Gemini 2.5 Flash' },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.injection')} />
      <SettingsRow
        label={t('ui.autoInjectRelevantMemory')}
        description={t('ui.automaticallyIncludeRelevantMemoriesInContext')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.maxInjectedTokens')}
        description={t('ui.tokenBudgetForMemoryInjection')}
      >
        <SettingsNumberInput defaultValue={4000} width="w-20" />
      </SettingsRow>
      <SettingsRow
        label={t('ui.injectionStrategy')}
        description={t('ui.howMemoryIsSelectedForInjection')}
      >
        <SettingsSelect
          options={[
            { value: 'relevance', label: t('ui.relevanceBased') },
            { value: 'recency', label: t('ui.recencyBased') },
            { value: 'hybrid', label: t('ui.hybrid') },
          ]}
          defaultValue="hybrid"
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.data')} />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-surface-2"
        >
          {t('ui.exportMemory')}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-surface-2"
        >
          {t('ui.importMemory')}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-destructive/40 px-3 py-1.5 text-[12px] text-destructive transition-colors hover:bg-destructive/10"
        >
          {t('ui.clearAll')}
        </button>
      </div>
    </div>
  );
}

export function PermissionsSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.defaultBehavior')} />
      <SettingsRow
        label={t('ui.defaultApprovalMode')}
        description={t('ui.howPermissionRequestsAreHandledByDefault')}
      >
        <SettingsSelect
          options={[
            { value: 'ask', label: t('ui.askBeforeRiskyActions') },
            { value: 'everything', label: t('ui.askForEverything') },
            { value: 'approve', label: t('ui.autoApproveAll') },
            { value: 'plan', label: t('ui.planOnlyNeverApply') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.rememberApprovalChoices')}
        description={t('ui.rememberPerActionApprovalDecisions')}
      >
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.highRiskActions')} />
      <SettingsRow label={t('ui.fileDeletion')} description={t('ui.policyForDeletingFiles')}>
        <SettingsSelect
          options={[
            { value: 'ask', label: 'Always ask' },
            { value: 'full', label: t('ui.allowInFullAccessMode') },
            { value: 'block', label: t('ui.alwaysBlock') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.terminalExecution')}
        description={t('ui.policyForRunningTerminalCommands')}
      >
        <SettingsSelect
          options={[
            { value: 'ask', label: 'Always ask' },
            { value: 'safe', label: t('ui.allowSafeCommands') },
            { value: 'all', label: t('ui.allowAll') },
            { value: 'block', label: 'Block' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.gitOperations')} description={t('ui.policyForGitPushForcePushEtc')}>
        <SettingsSelect
          options={[
            { value: 'ask', label: 'Always ask' },
            { value: 'safe', label: t('ui.allowNonDestructive') },
            { value: 'all', label: t('ui.allowAll') },
            { value: 'block', label: 'Block' },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.networkRequests')}
        description={t('ui.policyForOutboundNetworkCalls')}
      >
        <SettingsSelect
          options={[
            { value: 'ask', label: 'Always ask' },
            { value: 'hosts', label: t('ui.allowKnownHosts') },
            { value: 'all', label: t('ui.allowAll') },
            { value: 'block', label: 'Block' },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.perWorkspaceOverrides')} />
      <SettingsInfoBanner>{t('ui.perWorkspacePermissionOverrides')}</SettingsInfoBanner>
    </div>
  );
}
