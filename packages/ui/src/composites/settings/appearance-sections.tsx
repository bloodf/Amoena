import {
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from "@/components/settings-controls";

export function GeneralSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Appearance" />
      <SettingsRow label="Theme" description="Application color scheme">
        <SettingsSelect options={["Dark", "Light", "System"]} />
      </SettingsRow>
      <SettingsRow label="Language" description="Interface language">
        <SettingsSelect options={["English", "日本語", "中文", "Español", "Français", "Deutsch"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Behavior" />
      <SettingsRow label="Startup behavior" description="What happens when Amoena launches">
        <SettingsSelect options={["Resume last session", "Show home screen", "Open new session", "Show setup wizard"]} />
      </SettingsRow>
      <SettingsRow label="Default landing screen" description="Primary screen on startup">
        <SettingsSelect options={["Home", "Session", "Autopilot"]} />
      </SettingsRow>
      <SettingsRow label="Confirm before close" description="Warn when closing with active sessions">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Auto-save sessions" description="Persist session state automatically">
        <SettingsToggle on />
      </SettingsRow>
    </div>
  );
}

export function EditorSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Font" />
      <SettingsRow label="Font size">
        <SettingsNumberInput defaultValue={13} />
      </SettingsRow>
      <SettingsRow label="Font family">
        <SettingsSelect options={["JetBrains Mono", "Fira Code", "Source Code Pro", "Cascadia Code", "Menlo"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Layout" />
      <SettingsRow label="Tab width">
        <SettingsSelect options={["2", "4", "8"]} defaultValue="2" />
      </SettingsRow>
      <SettingsRow label="Word wrap">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Line numbers">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Minimap" description="Show code overview sidebar">
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title="Diff" />
      <SettingsRow label="Diff view" description="How diffs are displayed">
        <SettingsSelect options={["Inline", "Side-by-side", "Unified"]} />
      </SettingsRow>
      <SettingsRow label="Show whitespace changes">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Context lines" description="Lines of context around changes">
        <SettingsNumberInput defaultValue={3} />
      </SettingsRow>
    </div>
  );
}

export function TerminalSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Shell" />
      <SettingsRow label="Default shell">
        <SettingsSelect options={["bash", "zsh", "fish", "PowerShell", "sh"]} defaultValue="zsh" />
      </SettingsRow>
      <SettingsRow label="Shell arguments" description="Additional arguments passed to shell">
        <input defaultValue="--login" className="w-32 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground" />
      </SettingsRow>

      <SettingsSectionTitle title="Appearance" />
      <SettingsRow label="Font family">
        <SettingsSelect options={["JetBrains Mono", "Fira Code", "Menlo", "Cascadia Code"]} />
      </SettingsRow>
      <SettingsRow label="Font size">
        <SettingsNumberInput defaultValue={13} />
      </SettingsRow>
      <SettingsRow label="Cursor style">
        <SettingsSelect options={["Block", "Underline", "Bar"]} />
      </SettingsRow>
      <SettingsRow label="ANSI color theme">
        <SettingsSelect options={["Amoena Dark", "One Dark", "Solarized", "Dracula", "Nord"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Behavior" />
      <SettingsRow label="Scrollback lines">
        <SettingsNumberInput defaultValue={10000} width="w-20" />
      </SettingsRow>
      <SettingsRow label="Copy on select" description="Auto-copy selected text to clipboard">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Right-click paste" description="Paste on right-click in terminal">
        <SettingsToggle />
      </SettingsRow>
    </div>
  );
}
