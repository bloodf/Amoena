import { AlertTriangle, Check, Circle, Radio, Shield, Smartphone, Wifi, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { SectionHeading, StatusPill, SurfacePanel } from "@/components/patterns";
import type { RelayStatus, RemoteDevice } from "./types";

const relayConfig: Record<RelayStatus, { label: string; color: string }> = {
  lan: { label: "LAN", color: "text-green" },
  relay: { label: "Relay", color: "text-warning" },
  offline: { label: "Offline", color: "text-destructive" },
  waiting: { label: "Waiting", color: "text-muted-foreground" },
};

interface RemoteDevicesPanelProps {
  devices: RemoteDevice[];
  confirmRevoke: string | null;
  onToggleTrust: (name: string) => void;
  onAskRevoke: (name: string) => void;
  onCancelRevoke: () => void;
  onConfirmRevoke: (name: string) => void;
}

export function RemoteDevicesPanel({
  devices,
  confirmRevoke,
  onToggleTrust,
  onAskRevoke,
  onCancelRevoke,
  onConfirmRevoke,
}: RemoteDevicesPanelProps) {
  return (
    <section>
      <SectionHeading as="h2" className="mb-3">Connected Devices</SectionHeading>
      {(!devices || devices.length === 0) ? (
        <SurfacePanel padding="p-8" className="text-center">
          <Smartphone size={24} className="mx-auto mb-2 text-muted-foreground" />
          <div className="text-[13px] text-muted-foreground">No devices connected</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Scan the QR code with your mobile companion app</div>
        </SurfacePanel>
      ) : (
        <div className="overflow-hidden rounded border border-border">
          {devices.map((device, index) => (
            <div key={device.name} className={cn("px-4 py-3 transition-colors hover:bg-surface-2", index > 0 && "border-t border-border")}>
              <div className="flex items-center">
                <Smartphone size={16} className="text-muted-foreground" />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-foreground">{device.name}</span>
                    <button onClick={() => onToggleTrust(device.name)} type="button">
                      {device.trusted ? (
                        <StatusPill
                          tone="success"
                          className="flex items-center gap-1 transition-colors hover:bg-green/30"
                          label={
                            <>
                              <Shield size={8} /> Trusted
                            </>
                          }
                        />
                      ) : (
                        <StatusPill tone="warning" className="transition-colors hover:bg-warning/30" label="Unverified" />
                      )}
                    </button>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {device.ip} · Connected since {device.connectedSince}
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Circle size={5} className="fill-green text-green" />
                      <span className="text-muted-foreground">{device.lastSeen}</span>
                    </div>
                    <div className={cn("flex items-center gap-1 text-[10px]", relayConfig[device.relay].color)}>
                      {device.relay === "lan" ? <Wifi size={9} /> : <Radio size={9} />}
                      <span>{relayConfig[device.relay].label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>Perms: {(device.permissions ?? []).join(", ")}</span>
                    </div>
                  </div>
                </div>

                {confirmRevoke === device.name ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => onConfirmRevoke(device.name)}
                      variant="destructive"
                      size="sm"
                      className="h-7 gap-1 text-[10px]"
                    >
                      <Check size={10} /> Confirm
                    </Button>
                    <Button onClick={onCancelRevoke} variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => onAskRevoke(device.name)}
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 border-destructive/40 text-[11px] text-destructive hover:bg-destructive/10"
                  >
                    <X size={11} />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {devices.some((device) => !device.trusted) ? (
        <div className="mt-4 flex items-start gap-2 rounded border border-warning/20 bg-warning/5 p-3">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0 text-warning" />
          <span className="text-[11px] text-muted-foreground">
            You have unverified devices connected. Verify device trust before granting elevated permissions.
          </span>
        </div>
      ) : null}
    </section>
  );
}
