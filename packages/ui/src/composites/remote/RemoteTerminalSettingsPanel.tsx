import { Switch } from "@/primitives/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives/select";
import { SectionHeading, SurfacePanel } from "@/components/patterns";

interface RemoteTerminalSettingsPanelProps {
  remoteTerminal: boolean;
  readOnlyMode: boolean;
  sessionTimeout: string;
  onToggleRemoteTerminal: () => void;
  onToggleReadOnlyMode: () => void;
  onSessionTimeoutChange: (value: string) => void;
}

export function RemoteTerminalSettingsPanel({
  remoteTerminal,
  readOnlyMode,
  sessionTimeout,
  onToggleRemoteTerminal,
  onToggleReadOnlyMode,
  onSessionTimeoutChange,
}: RemoteTerminalSettingsPanelProps) {
  return (
    <section>
      <SectionHeading as="h2" className="mb-3">Remote Terminal</SectionHeading>
      <SurfacePanel className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-foreground">Allow remote terminal access</span>
          <Switch checked={remoteTerminal} onCheckedChange={onToggleRemoteTerminal} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-foreground">Session timeout</span>
          <Select value={sessionTimeout} onValueChange={onSessionTimeoutChange}>
            <SelectTrigger className="h-8 w-[130px] bg-surface-2 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 minutes">30 minutes</SelectItem>
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="4 hours">4 hours</SelectItem>
              <SelectItem value="Never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-foreground">Remote read-only mode</span>
          <Switch checked={readOnlyMode} onCheckedChange={onToggleReadOnlyMode} />
        </div>
      </SurfacePanel>
    </section>
  );
}
