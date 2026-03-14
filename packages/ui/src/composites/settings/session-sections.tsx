import {
  SettingsInfoBanner,
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from "@/components/settings-controls";

export function SessionSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Defaults" />
      <SettingsRow label="Default model" description="Model used for new sessions">
        <SettingsSelect options={["Claude 4 Sonnet", "Claude 4 Opus", "GPT-5.4", "Gemini 2.5 Pro"]} />
      </SettingsRow>
      <SettingsRow label="Default reasoning mode" description="Reasoning behavior for new sessions">
        <SettingsSelect options={["Auto", "Always On", "Off"]} />
      </SettingsRow>
      <SettingsRow label="Default reasoning depth">
        <SettingsSelect options={["Low", "Medium", "High", "Extra High"]} defaultValue="High" />
      </SettingsRow>
      <SettingsRow label="Default permission preset">
        <SettingsSelect options={["Default (ask before risky)", "Full access", "Plan only", "Read only"]} />
      </SettingsRow>
      <SettingsRow label="Default work target">
        <SettingsSelect options={["Local project", "New worktree", "Cloud"]} />
      </SettingsRow>

      <SettingsSectionTitle title="New Session Behavior" />
      <SettingsRow label="Auto-include open files" description="Attach open editor files to new sessions">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Include IDE context" description="Pass editor selection and open tabs">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Max context tokens" description="Soft limit for context injection">
        <SettingsNumberInput defaultValue={32000} width="w-20" />
      </SettingsRow>
    </div>
  );
}

export function MemorySettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Observation" />
      <SettingsRow label="Observation retention" description="How long auto-captured observations are kept">
        <SettingsSelect options={["Session only", "7 days", "30 days", "Forever"]} defaultValue="30 days" />
      </SettingsRow>
      <SettingsRow label="Auto-summarize sessions" description="Generate memory summaries after sessions end">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Summary generation model" description="Model used for memory summarization">
        <SettingsSelect options={["Same as session", "Claude 4 Haiku", "GPT-5.3-Codex-Spark", "Gemini 2.5 Flash"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Injection" />
      <SettingsRow label="Auto-inject relevant memory" description="Automatically include relevant memories in context">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Max injected tokens" description="Token budget for memory injection">
        <SettingsNumberInput defaultValue={4000} width="w-20" />
      </SettingsRow>
      <SettingsRow label="Injection strategy" description="How memory is selected for injection">
        <SettingsSelect options={["Relevance-based", "Recency-based", "Hybrid"]} defaultValue="Hybrid" />
      </SettingsRow>

      <SettingsSectionTitle title="Data" />
      <div className="mt-2 flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-surface-2">Export Memory</button>
        <button className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-surface-2">Import Memory</button>
        <button className="flex items-center gap-1.5 rounded border border-destructive/40 px-3 py-1.5 text-[12px] text-destructive transition-colors hover:bg-destructive/10">Clear All</button>
      </div>
    </div>
  );
}

export function PermissionsSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Default Behavior" />
      <SettingsRow label="Default approval mode" description="How permission requests are handled by default">
        <SettingsSelect options={["Ask before risky actions", "Ask for everything", "Auto-approve all", "Plan only (never apply)"]} />
      </SettingsRow>
      <SettingsRow label="Remember approval choices" description="Remember per-action approval decisions">
        <SettingsToggle on />
      </SettingsRow>

      <SettingsSectionTitle title="High-Risk Actions" />
      <SettingsRow label="File deletion" description="Policy for deleting files">
        <SettingsSelect options={["Always ask", "Allow in full-access mode", "Always block"]} />
      </SettingsRow>
      <SettingsRow label="Terminal execution" description="Policy for running terminal commands">
        <SettingsSelect options={["Always ask", "Allow safe commands", "Allow all", "Block"]} />
      </SettingsRow>
      <SettingsRow label="Git operations" description="Policy for git push, force-push, etc.">
        <SettingsSelect options={["Always ask", "Allow non-destructive", "Allow all", "Block"]} />
      </SettingsRow>
      <SettingsRow label="Network requests" description="Policy for outbound network calls">
        <SettingsSelect options={["Always ask", "Allow known hosts", "Allow all", "Block"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Per-Workspace Overrides" />
      <SettingsInfoBanner>Per-workspace permission overrides can be configured in individual workspace settings.</SettingsInfoBanner>
    </div>
  );
}
