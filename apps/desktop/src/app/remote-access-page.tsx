import { useCallback, useEffect, useState } from 'react';

import {
  RemoteDevicesPanel,
  RemotePairingPanel,
  RemoteTerminalSettingsPanel,
  ScreenActions,
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderText,
  ScreenRoot,
  ScreenStack,
  ScreenSubtitle,
  ScreenTitle,
} from '@lunaria/ui';

import { useRuntimeApi } from './runtime-api';

type RemoteDevice = {
  deviceId: string;
  name: string;
  status: string;
  lastSeen: string;
  platform?: string | null;
  scopes: string[];
};

type LanStatus = {
  enabled: boolean;
  lanBaseUrl?: string | null;
  bindAddress: string;
};

type PairingIntent = {
  pinCode: string;
  expiresAtUnixMs: number;
};

export function RuntimeRemoteAccessPage() {
  const { request } = useRuntimeApi();
  const [devices, setDevices] = useState<RemoteDevice[]>([]);
  const [lanStatus, setLanStatus] = useState<LanStatus | null>(null);
  const [pairingIntent, setPairingIntent] = useState<PairingIntent | null>(null);
  const [showPin, setShowPin] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    const [nextDevices, nextLanStatus] = await Promise.all([
      request<RemoteDevice[]>('/api/v1/remote/devices'),
      request<LanStatus>('/api/v1/remote/lan'),
    ]);
    setDevices(nextDevices);
    setLanStatus(nextLanStatus);
  }, [request]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <ScreenRoot>
      <ScreenContainer className="max-w-[640px]">
        <ScreenStack className="space-y-8">
          <ScreenHeader>
            <ScreenHeaderText>
              <ScreenTitle>Remote Access</ScreenTitle>
              <ScreenSubtitle>
                Pair devices, review trust state, and manage remote terminal access.
              </ScreenSubtitle>
            </ScreenHeaderText>
            <ScreenActions>
              <button
                className="rounded border border-border px-3 py-1.5 text-[12px]"
                onClick={async () => {
                  const next = await request<LanStatus>('/api/v1/remote/lan', {
                    method: 'POST',
                    body: JSON.stringify({
                      enabled: !(lanStatus?.enabled ?? false),
                      bindAddress: '127.0.0.1',
                    }),
                  });
                  setLanStatus(next);
                }}
              >
                {lanStatus?.enabled ? 'Disable LAN' : 'Enable LAN'}
              </button>
            </ScreenActions>
          </ScreenHeader>

          <RemotePairingPanel
            pin={pairingIntent?.pinCode ?? '— — —'}
            expiryLabel={
              pairingIntent
                ? `expires ${new Date(pairingIntent.expiresAtUnixMs).toLocaleTimeString()}`
                : 'Generate a fresh pairing code'
            }
            showPin={showPin}
            onTogglePin={() => setShowPin((previous) => !previous)}
            onRegenerate={async () => {
              const next = await request<PairingIntent>('/api/v1/remote/pairing/intents', {
                method: 'POST',
                body: JSON.stringify({}),
              });
              setPairingIntent(next);
            }}
          />

          <RemoteDevicesPanel
            devices={devices.map((device) => ({
              name: device.name,
              ip: device.platform ?? 'paired',
              connectedSince: 'paired',
              trusted: device.status === 'active',
              lastSeen: device.lastSeen,
              relay: 'lan',
              permissions: device.scopes,
            }))}
            confirmRevoke={confirmRevoke}
            onToggleTrust={() => {}}
            onAskRevoke={setConfirmRevoke}
            onCancelRevoke={() => setConfirmRevoke(null)}
            onConfirmRevoke={async (name) => {
              const target = devices.find((device) => device.name === name);
              if (!target) return;
              await request<void>(`/api/v1/remote/devices/${target.deviceId}/revoke`, {
                method: 'POST',
              });
              setConfirmRevoke(null);
              await hydrate();
            }}
          />

          <RemoteTerminalSettingsPanel
            remoteTerminal={true}
            readOnlyMode={false}
            sessionTimeout="30 minutes"
            onToggleRemoteTerminal={() => {}}
            onToggleReadOnlyMode={() => {}}
            onSessionTimeoutChange={() => {}}
          />
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
