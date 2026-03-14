import { useState } from "react";
import { Clock, Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScreenActions, ScreenContainer, ScreenHeader, ScreenHeaderText, ScreenRoot, ScreenStack, ScreenSubtitle, ScreenTitle } from "@/components/screen";
import { initialRemoteDevices, relayConfig } from "@/composites/remote/config";
import { RemoteDevicesPanel } from "@/composites/remote/RemoteDevicesPanel";
import { RemotePairingPanel } from "@/composites/remote/RemotePairingPanel";
import { RemoteTerminalSettingsPanel } from "@/composites/remote/RemoteTerminalSettingsPanel";
import type { RelayStatus } from "@/composites/remote/types";

export function RemoteAccessScreen() {
  const [devices, setDevices] = useState(initialRemoteDevices);
  const [pin, setPin] = useState("847 291");
  const [expirySeconds, setExpirySeconds] = useState(872);
  const [showPin, setShowPin] = useState(true);
  const [remoteTerminal, setRemoteTerminal] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const hasDevices = devices.length > 0;
  const currentRelay: RelayStatus = hasDevices ? "lan" : "waiting";
  const rc = relayConfig[currentRelay];
  const RelayIcon = rc.iconKey === "wifi" ? Wifi : rc.iconKey === "radio" ? Radio : rc.iconKey === "wifi-off" ? WifiOff : Clock;

  const regeneratePin = () => {
    const n1 = Math.floor(Math.random() * 900 + 100);
    const n2 = Math.floor(Math.random() * 900 + 100);
    setPin(`${n1} ${n2}`);
    setExpirySeconds(900);
  };

  const revokeDevice = (name: string) => {
    setDevices(prev => prev.filter(d => d.name !== name));
    setConfirmRevoke(null);
  };

  const toggleTrust = (name: string) => {
    setDevices(prev => prev.map(d => d.name === name ? { ...d, trusted: !d.trusted } : d));
  };

  const formatExpiry = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <ScreenRoot>
      <ScreenContainer className="max-w-[640px]">
        <ScreenStack className="space-y-8">
          <ScreenHeader>
            <ScreenHeaderText>
              <ScreenTitle>Remote Access</ScreenTitle>
              <ScreenSubtitle>Pair mobile devices, review trust state, and configure terminal access.</ScreenSubtitle>
            </ScreenHeaderText>
            <ScreenActions>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono",
                  rc.color,
                  currentRelay === ("lan" as RelayStatus)
                    ? "bg-green/10"
                    : currentRelay === ("relay" as RelayStatus)
                      ? "bg-warning/10"
                      : "bg-surface-2",
                )}
              >
                <RelayIcon size={12} />
                {rc.label}
              </div>
            </ScreenActions>
          </ScreenHeader>

          <RemotePairingPanel
            pin={pin}
            expiryLabel={formatExpiry(expirySeconds)}
            showPin={showPin}
            onTogglePin={() => setShowPin(!showPin)}
            onRegenerate={regeneratePin}
          />
          <RemoteDevicesPanel
            devices={devices}
            confirmRevoke={confirmRevoke}
            onToggleTrust={toggleTrust}
            onAskRevoke={setConfirmRevoke}
            onCancelRevoke={() => setConfirmRevoke(null)}
            onConfirmRevoke={revokeDevice}
          />
          <RemoteTerminalSettingsPanel
            remoteTerminal={remoteTerminal}
            readOnlyMode={readOnlyMode}
            sessionTimeout={sessionTimeout}
            onToggleRemoteTerminal={() => setRemoteTerminal(!remoteTerminal)}
            onToggleReadOnlyMode={() => setReadOnlyMode(!readOnlyMode)}
            onSessionTimeoutChange={setSessionTimeout}
          />
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
