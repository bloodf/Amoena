import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import {
  createRuntimeClient,
  type RemotePairingCompleteRequest,
} from "@lunaria/runtime-client";

import {
  secureRuntimeSessionStorage,
  type RuntimeSessionStorage,
  type StoredRemoteSession,
} from "./storage";

type ClientContextValue = {
  auth: StoredRemoteSession | null;
  client: ReturnType<typeof createRuntimeClient> | null;
  isHydrated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  pairWithDesktop: (input: {
    baseUrl: string;
    pairingToken: string;
    pin: string;
    deviceName: string;
  }) => Promise<void>;
  clearPairing: () => Promise<void>;
};

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({
  children,
  storage = secureRuntimeSessionStorage,
}: {
  children: ReactNode;
  storage?: RuntimeSessionStorage;
}) {
  const [auth, setAuth] = useState<StoredRemoteSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const saved = await storage.load();
      if (!cancelled) {
        setAuth(saved);
        setIsHydrated(true);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const client = useMemo(
    () =>
      auth
        ? createRuntimeClient({ baseUrl: auth.baseUrl, authToken: auth.accessToken })
        : null,
    [auth],
  );

  const pairWithDesktop = async (input: {
    baseUrl: string;
    pairingToken: string;
    pin: string;
    deviceName: string;
  }) => {
    try {
      const pairClient = createRuntimeClient({ baseUrl: input.baseUrl });
      const body: RemotePairingCompleteRequest = {
        pairingToken: input.pairingToken,
        pin: input.pin,
        deviceName: input.deviceName,
        deviceType: "mobile",
        platform: Platform.OS,
      };
      const paired = await pairClient.completePairing(body);
      const stored = {
        ...paired,
        pairedAt: new Date().toISOString(),
      } satisfies StoredRemoteSession;
      await storage.save(stored);
      setAuth(stored);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pair with desktop");
    }
  };

  const clearPairing = async () => {
    await storage.clear();
    setAuth(null);
    setError(null);
  };

  return (
    <ClientContext.Provider
      value={{ auth, client, isHydrated, error, setError, pairWithDesktop, clearPairing }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const value = useContext(ClientContext);
  if (!value) throw new Error("useClient must be used inside ClientProvider");
  return value;
}
