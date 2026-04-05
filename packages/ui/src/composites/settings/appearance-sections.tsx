import {
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from '@/components/settings-controls';
import { useTranslation } from 'react-i18next';

export function GeneralSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.appearance')} />
      <SettingsRow label={t('ui.theme')} description={t('ui.applicationColorScheme')}>
        <SettingsSelect
          options={[
            { value: 'dark', label: t('ui.dark') },
            { value: 'light', label: t('ui.light') },
            { value: 'system', label: t('ui.system') },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.language')} description={t('ui.interfaceLanguage')}>
        <SettingsSelect
          options={[
            { value: 'en', label: 'English' },
            { value: 'ja', label: '日本語' },
            { value: 'zh', label: '中文' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.behavior')} />
      <SettingsRow label={t('ui.startupBehavior')} description={t('ui.whatHappensWhenLaunches')}>
        <SettingsSelect
          options={[
            { value: 'resume', label: t('ui.resumeLastSession') },
            { value: 'home', label: t('ui.showHomeScreen') },
            { value: 'new', label: t('ui.openNewSession') },
            { value: 'wizard', label: t('ui.showSetupWizard') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.defaultLandingScreen')}
        description={t('ui.primaryScreenOnStartup')}
      >
        <SettingsSelect
          options={[
            { value: 'home', label: t('ui.home') },
            { value: 'session', label: t('ui.session') },
            { value: 'autopilot', label: t('ui.autopilot') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.defaultLandingScreen')}
        description={t('ui.primaryScreenOnStartup')}
      >
        <SettingsSelect
          options={[
            { value: 'home', label: t('ui.home') },
            { value: 'session', label: t('ui.session') },
            { value: 'autopilot', label: t('ui.autopilot') },
          ]}
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.confirmBeforeClose')}
        description={t('ui.warnWhenClosingWithActiveSessions')}
      >
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow
        label={t('ui.autoSaveSessions')}
        description={t('ui.persistSessionStateAutomatically')}
      >
        <SettingsToggle on />
      </SettingsRow>
    </div>
  );
}

export function EditorSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.font')} />
      <SettingsRow label={t('ui.fontSize')}>
        <SettingsNumberInput defaultValue={13} />
      </SettingsRow>
      <SettingsRow label={t('ui.fontFamily')}>
        <SettingsSelect
          options={[
            { value: 'jetbrains', label: 'JetBrains Mono' },
            { value: 'fira', label: 'Fira Code' },
            { value: 'source', label: 'Source Code Pro' },
            { value: 'cascadia', label: 'Cascadia Code' },
            { value: 'menlo', label: 'Menlo' },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.layout')} />
      <SettingsRow label={t('ui.tabWidth')}>
        <SettingsSelect
          options={[
            { value: '2', label: '2' },
            { value: '4', label: '4' },
            { value: '8', label: '8' },
          ]}
          defaultValue="2"
        />
      </SettingsRow>
      <SettingsRow label={t('ui.wordWrap')}>
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label={t('ui.lineNumbers')}>
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label={t('ui.minimap')} description={t('ui.showCodeOverviewSidebar')}>
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.diff')} />
      <SettingsRow label={t('ui.diffView')} description={t('ui.howDiffsAreDisplayed')}>
        <SettingsSelect
          options={[
            { value: 'inline', label: t('ui.inline') },
            { value: 'side', label: t('ui.sideBySide') },
            { value: 'unified', label: t('ui.unified') },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.showWhitespaceChanges')}>
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label={t('ui.contextLines')} description={t('ui.linesOfContextAroundChanges')}>
        <SettingsNumberInput defaultValue={3} />
      </SettingsRow>
    </div>
  );
}

export function TerminalSettingsSection() {
  const { t } = useTranslation();
  return (
    <div>
      <SettingsSectionTitle title={t('ui.shell')} />
      <SettingsRow label={t('ui.defaultShell')}>
        <SettingsSelect
          options={[
            { value: 'bash', label: 'bash' },
            { value: 'zsh', label: 'zsh' },
            { value: 'fish', label: 'fish' },
            { value: 'powershell', label: 'PowerShell' },
            { value: 'sh', label: 'sh' },
          ]}
          defaultValue="zsh"
        />
      </SettingsRow>
      <SettingsRow
        label={t('ui.shellArguments')}
        description={t('ui.additionalArgumentsPassedToShell')}
      >
        <input
          defaultValue="--login"
          className="w-32 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground"
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.appearance')} />
      <SettingsRow label={t('ui.fontFamily')}>
        <SettingsSelect
          options={[
            { value: 'jetbrains', label: 'JetBrains Mono' },
            { value: 'fira', label: 'Fira Code' },
            { value: 'menlo', label: 'Menlo' },
            { value: 'cascadia', label: 'Cascadia Code' },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.fontSize')}>
        <SettingsNumberInput defaultValue={13} />
      </SettingsRow>
      <SettingsRow label={t('ui.cursorStyle')}>
        <SettingsSelect
          options={[
            { value: 'block', label: t('ui.block') },
            { value: 'underline', label: t('ui.underline') },
            { value: 'bar', label: t('ui.bar') },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t('ui.ansiColorTheme')}>
        <SettingsSelect
          options={[
            { value: 'amoena', label: 'Amoena Dark' },
            { value: 'onedark', label: 'One Dark' },
            { value: 'solarized', label: 'Solarized' },
            { value: 'dracula', label: 'Dracula' },
            { value: 'nord', label: 'Nord' },
          ]}
        />
      </SettingsRow>

      <SettingsSectionTitle title={t('ui.behavior')} />
      <SettingsRow label={t('ui.scrollbackLines')}>
        <SettingsNumberInput defaultValue={10000} width="w-20" />
      </SettingsRow>
      <SettingsRow
        label={t('ui.copyOnSelect')}
        description={t('ui.autoCopySelectedTextToClipboard')}
      >
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow
        label={t('ui.rightClickPaste')}
        description={t('ui.pasteOnRightClickInTerminal')}
      >
        <SettingsToggle />
      </SettingsRow>
    </div>
  );
}
