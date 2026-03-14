import {
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
  SettingsWarningBanner,
} from "@/components/settings-controls";
import { Trash2 } from "lucide-react";

export function PrivacySettingsSection() {
  return (
    <div>
      <SettingsWarningBanner>Changes to privacy settings take effect immediately for new sessions. Existing sessions retain their current settings.</SettingsWarningBanner>
      <SettingsSectionTitle title="Telemetry" />
      <SettingsRow label="Usage analytics" description="Send anonymized usage statistics">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Crash reporting" description="Send crash reports to help improve Lunaria">
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title="Data Handling" />
      <SettingsRow label="Sensitive content handling" description="How to treat files marked as sensitive">
        <SettingsSelect options={["Redact before sending", "Warn before sending", "Block entirely", "No restrictions"]} />
      </SettingsRow>
      <SettingsRow label="Data retention" description="How long session data is stored locally">
        <SettingsSelect options={["7 days", "30 days", "90 days", "1 year", "Forever"]} defaultValue="30 days" />
      </SettingsRow>
      <SettingsRow label="Auto-redact secrets" description="Automatically redact API keys, tokens, and passwords">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Redaction patterns" description="Custom regex patterns for content redaction">
        <button className="text-[11px] text-primary hover:text-primary/80">Configure →</button>
      </SettingsRow>

      <SettingsSectionTitle title="Cleanup" />
      <SettingsRow label="Clear all session history" description="Permanently delete all stored sessions">
        <button className="flex items-center gap-1 rounded border border-destructive/40 px-2.5 py-1 text-[11px] text-destructive transition-colors hover:bg-destructive/10">
          <Trash2 size={10} /> Clear
        </button>
      </SettingsRow>
    </div>
  );
}

export function AdvancedSettingsSection() {
  return (
    <div>
      <SettingsWarningBanner>Advanced settings can affect stability. Only change these if you know what you're doing.</SettingsWarningBanner>
      <SettingsSectionTitle title="Developer" />
      <SettingsRow label="Developer mode" description="Show debug information and extra diagnostics">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Runtime diagnostics" description="Show runtime performance metrics in status bar">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Verbose logging" description="Enable detailed debug logging to console">
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title="Experimental" />
      <SettingsRow label="Experimental features" description="Enable features that may be unstable">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Canvas rendering" description="Use canvas-based rendering for timeline">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Streaming responses" description="Show agent responses as they stream">
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title="Backend" />
      <SettingsRow label="Axum runtime port" description="Local runtime server port">
        <SettingsNumberInput defaultValue={3847} width="w-20" />
      </SettingsRow>
      <SettingsRow label="Max concurrent agents" description="Maximum agents running simultaneously">
        <SettingsNumberInput defaultValue={4} />
      </SettingsRow>
      <SettingsRow label="Request timeout" description="Timeout for provider API calls">
        <SettingsSelect options={["30s", "60s", "120s", "300s"]} defaultValue="60s" />
      </SettingsRow>
    </div>
  );
}
