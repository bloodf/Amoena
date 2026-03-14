import * as SecureStore from "expo-secure-store";

import type { RemotePairingSession } from "@lunaria/runtime-client";

const STORAGE_KEY = "lunaria.remote.session";

export type StoredRemoteSession = RemotePairingSession & {
  pairedAt: string;
};

export interface RuntimeSessionStorage {
  clear(): Promise<void>;
  load(): Promise<StoredRemoteSession | null>;
  save(session: StoredRemoteSession): Promise<void>;
}

export const secureRuntimeSessionStorage: RuntimeSessionStorage = {
  async clear() {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },
  async load() {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredRemoteSession) : null;
  },
  async save(session) {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
  },
};
