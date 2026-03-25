import { Download, Palette, Plus, Puzzle, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SettingsInfoBanner,
  SettingsNumberInput,
  SettingsRow,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from "@/components/settings-controls";
import { installedPlugins, installedThemes, keybindings } from "./data";

export function PluginsSettingsSection() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{installedPlugins.length} installed</span>
        <button className="flex items-center gap-1.5 rounded border border-primary px-3 py-1.5 text-[12px] text-primary transition-colors hover:bg-primary/10">
          <Plus size={12} /> Browse Marketplace
        </button>
      </div>

      {installedPlugins.map((plugin) => (
        <div key={plugin.name} className="mb-2 rounded border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle size={14} className="text-muted-foreground" />
              <span className="text-[13px] font-medium text-foreground">{plugin.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">v{plugin.version}</span>
              {plugin.updateAvailable ? <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] text-primary">Update available</span> : null}
            </div>
            <SettingsToggle on={plugin.enabled} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>by {plugin.author}</span>
            <span className={cn("rounded px-1.5 py-0.5 text-[9px]", plugin.trusted ? "bg-green/20 text-green" : "bg-warning/20 text-warning")}>
              {plugin.trusted ? "Trusted" : "Unverified"}
            </span>
            <span>Permissions: {plugin.permissions.join(", ")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThemesSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Active Theme" />
      {installedThemes.map((theme) => (
        <div key={theme.name} className={cn("mb-1 flex items-center justify-between rounded border px-3 py-3 transition-colors", theme.active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
          <div className="flex items-center gap-3">
            <Palette size={14} className={theme.active ? "text-primary" : "text-muted-foreground"} />
            <div>
              <div className="text-[13px] text-foreground">{theme.name}</div>
              <div className="text-[10px] text-muted-foreground">{theme.author}</div>
            </div>
          </div>
          {theme.active ? <span className="font-mono text-[10px] text-primary">Active</span> : <button className="text-[11px] text-muted-foreground hover:text-foreground">Activate</button>}
        </div>
      ))}

      <SettingsSectionTitle title="Customization" />
      <SettingsRow label="Accent color" description="Primary accent color throughout the UI">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border border-border bg-primary" />
          <SettingsSelect options={["Magenta", "Purple", "Blue", "Teal", "Orange", "Rose"]} />
        </div>
      </SettingsRow>
      <SettingsRow label="UI density" description="Spacing density of interface elements">
        <SettingsSelect options={["Comfortable", "Compact", "Spacious"]} />
      </SettingsRow>
    </div>
  );
}

export function KeybindingsSettingsSection() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SettingsRow label="Preset" description="Keyboard shortcut preset">
          <SettingsSelect options={["Default", "Vim", "Emacs", "VS Code", "JetBrains"]} />
        </SettingsRow>
      </div>

      <SettingsSectionTitle title="Shortcuts" />
      <div className="overflow-hidden rounded border border-border">
        <div className="grid grid-cols-[1fr_100px_120px] border-b border-border bg-surface-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Action</span><span>Category</span><span>Binding</span>
        </div>
        {keybindings.map((keybinding, index) => (
          <div key={keybinding.action} className={cn("grid grid-cols-[1fr_100px_120px] items-center px-3 py-2 transition-colors hover:bg-surface-2", index > 0 && "border-t border-border")}>
            <span className="text-[12px] text-foreground">{keybinding.action}</span>
            <span className="text-[11px] text-muted-foreground">{keybinding.category}</span>
            <kbd className="w-fit rounded border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-foreground">{keybinding.binding}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationsSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Toast Behavior" />
      <SettingsRow label="Show toast notifications" description="Display non-blocking notifications">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Toast duration" description="How long toasts remain visible">
        <SettingsSelect options={["3 seconds", "5 seconds", "10 seconds", "Until dismissed"]} defaultValue="5 seconds" />
      </SettingsRow>
      <SettingsRow label="Toast position">
        <SettingsSelect options={["Bottom right", "Bottom left", "Top right", "Top center"]} />
      </SettingsRow>

      <SettingsSectionTitle title="Alerts" />
      <SettingsRow label="Critical alerts" description="Permission requests, errors, and rate limit warnings">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Background task completion" description="Notify when background tasks finish">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Sound effects" description="Play sounds for notifications">
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title="Remote" />
      <SettingsRow label="Remote approval notifications" description="Notify when remote device requests approval">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Mobile push notifications" description="Send push notifications to connected mobile app">
        <SettingsToggle />
      </SettingsRow>
    </div>
  );
}

export function WorkspaceSettingsSection() {
  return (
    <div>
      <SettingsSectionTitle title="Worktree" />
      <SettingsRow label="Default worktree location" description="Where new worktrees are created">
        <input defaultValue="~/.amoena/worktrees" className="w-48 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground" />
      </SettingsRow>
      <SettingsRow label="Auto-create worktree" description="Create worktree automatically for new branches">
        <SettingsToggle />
      </SettingsRow>

      <SettingsSectionTitle title="Clone" />
      <SettingsRow label="Clone strategy" description="How repositories are cloned">
        <SettingsSelect options={["Full clone", "Shallow clone (depth 1)", "Blobless clone", "Treeless clone"]} />
      </SettingsRow>
      <SettingsRow label="Default branch">
        <input defaultValue="main" className="w-24 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground" />
      </SettingsRow>

      <SettingsSectionTitle title="Merge & Review" />
      <SettingsRow label="Merge-review behavior" description="How changes are reviewed before applying back">
        <SettingsSelect options={["Always require review", "Auto-merge if no conflicts", "Manual only"]} />
      </SettingsRow>
      <SettingsRow label="Auto-cleanup" description="Delete worktrees after successful merge">
        <SettingsToggle />
      </SettingsRow>
      <SettingsRow label="Cleanup after (days)" description="Auto-delete unused worktrees after this many days">
        <SettingsNumberInput defaultValue={7} />
      </SettingsRow>
    </div>
  );
}
