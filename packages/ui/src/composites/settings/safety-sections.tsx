import {
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
  SettingsWarningBanner,
} from '@/components/settings-controls';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PrivacySettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsWarningBanner>{t('ui.privacySettingsBanner')}</SettingsWarningBanner>
      <SettingsSectionTitle title={t('ui.telemetry')} />
      <SettingsRow
        label={t('ui.usageAnalytics')}
        description={t('ui.sendAnonymizedUsageStatistics')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.crashReporting')}
        description={t('ui.sendCrashReportsToHelpImproveAmoena')}
      >
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.dataHandling')} />
      <SettingsRow
        label={t('ui.sensitiveContentHandling')}
        description={t('ui.howToTreatFilesMarkedAsSensitive')}
      >
        <SettingsSelect
          options={[
            { value: 'redact', label: t('ui.redactBeforeSending') },
            { value: 'warn', label: t('ui.warnBeforeSending') },
            { value: 'block', label: t('ui.blockEntirely') },
            { value: 'none', label: t('ui.noRestrictions') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.dataRetention')}
        description={t('ui.howLongSessionDataIsStoredLocally')}
      >
        <SettingsSelect
          options={[
            { value: '7', label: t('ui.sevenDays') },
            { value: '30', label: t('ui.thirtyDays') },
            { value: '90', label: t('ui.ninetyDays') },
            { value: '365', label: t('ui.oneYear') },
            { value: '0', label: t('ui.forever') },
          ]}
          defaultValue="30"
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.autoRedactSecrets')}
        description={t('ui.automaticallyRedactApiKeysTokensAndPasswords')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.redactionPatterns')}
        description={t('ui.customRegexPatternsForContentRedaction')}
      >
        <button type="button" className="text-[11px] text-primary hover:text-primary/80">
          {t('ui.configure')} →
        </button>
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.cleanup')} />
      <SettingsRow
        label={t('ui.clearAllSessionHistory')}
        description={t('ui.permanentlyDeleteAllStoredSessions')}
      >
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-destructive/40 px-2.5 py-1 text-[11px] text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={10} /> {t('ui.clear')}
        </button>
      </SettingsRow>
    </div>
  );
}

export function AdvancedSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsWarningBanner>{t('ui.advancedSettingsBanner')}</SettingsWarningBanner>
      <SettingsSectionTitle title={t('ui.developer')} />
      <SettingsRow
        label={t('ui.developerMode')}
        description={t('ui.showDebugInformationAndExtraDiagnostics')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.runtimeDiagnostics')}
        description={t('ui.showRuntimePerformanceMetricsInStatusBar')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.verboseLogging')}
        description={t('ui.enableDetailedDebugLoggingToConsole')}
      >
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.experimental')} />
      <SettingsRow
        label={t('ui.experimentalFeatures')}
        description={t('ui.enableFeaturesThatMayBeUnstable')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.canvasRendering')}
        description={t('ui.useCanvasBasedRenderingForTimeline')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.streamingResponses')}
        description={t('ui.showAgentResponsesAsTheyStream')}
      >
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.backend')} />
      <SettingsRow label={t('ui.axumRuntimePort')} description={t('ui.localRuntimeServerPort')}>
        <SettingsNumberInput defaultValue={3847} width="w-20" />
      </SettingsRow>
      <SettingsRow
        label={t('ui.maxConcurrentAgents')}
        description={t('ui.maximumAgentsRunningSimultaneously')}
      >
        <SettingsNumberInput defaultValue={4} />
      </SettingsRow>
      <SettingsRow label={t('ui.requestTimeout')} description={t('ui.timeoutForProviderApiCalls')}>
        <SettingsSelect
          options={[
            { value: '30', label: '30s' },
            { value: '60', label: '60s' },
            { value: '120', label: '120s' },
            { value: '300', label: '300s' },
          ]}
          defaultValue="60"
        />
      </SettingsRow>
    </div>
  );
}
