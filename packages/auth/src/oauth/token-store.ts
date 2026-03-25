import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import type { OAuthTokens } from './types';

const DEFAULT_TOKENS_PATH = join(homedir(), '.amoena', 'tokens.json');
const FILE_MODE = 0o600;

type TokenStore = Record<string, OAuthTokens>;

export class TokenStorage {
  private readonly filePath: string;

  constructor(filePath = DEFAULT_TOKENS_PATH) {
    this.filePath = filePath;
  }

  save(provider: string, tokens: OAuthTokens): void {
    const store = this._load();
    const updated: TokenStore = { ...store, [provider]: tokens };
    this._write(updated);
  }

  load(provider: string): OAuthTokens | null {
    const store = this._load();
    return store[provider] ?? null;
  }

  delete(provider: string): void {
    const store = this._load();
    const { [provider]: _removed, ...rest } = store;
    this._write(rest);
  }

  isExpired(tokens: OAuthTokens): boolean {
    if (!tokens.expiresAt) return false;
    return Date.now() >= tokens.expiresAt;
  }

  private _load(): TokenStore {
    if (!existsSync(this.filePath)) return {};
    try {
      const raw = readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw) as TokenStore;
    } catch {
      return {};
    }
  }

  private _write(store: TokenStore): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.filePath, JSON.stringify(store, null, 2), { encoding: 'utf8' });
    chmodSync(this.filePath, FILE_MODE);
  }
}
