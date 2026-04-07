import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';
import { setupWizardKeybindingPresets, setupWizardReasoningModes, setupWizardThemes } from "./data";

export function SetupWizardProfileStep({
  theme,
  reasoningMode,
  keybindingPreset,
  onThemeChange,
  onReasoningModeChange,
  onKeybindingPresetChange,
}: {
  theme: string;
  reasoningMode: string;
  keybindingPreset: string;
  onThemeChange: (value: string) => void;
  onReasoningModeChange: (value: string) => void;
  onKeybindingPresetChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Agent Profile</h2>
        <p className="text-sm text-muted-foreground">
          Set the defaults that shape your preferred working style.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Theme</label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {setupWizardThemes.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Reasoning Mode</label>
          <Select value={reasoningMode} onValueChange={onReasoningModeChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {setupWizardReasoningModes.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Keybinding Preset</label>
          <Select value={keybindingPreset} onValueChange={onKeybindingPresetChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {setupWizardKeybindingPresets.map((preset) => (
                <SelectItem key={preset} value={preset}>{preset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
