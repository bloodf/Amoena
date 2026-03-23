import { randomBytes } from "node:crypto";

// --- Types ---

export type SessionToken = {
  readonly token: string;
  readonly userId: string | undefined;
  readonly createdAt: number;
  readonly expiresAt: number;
};

// --- Constants ---

const TOKEN_BYTES = 32;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- Core functions ---

export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function createSession(userId?: string): SessionToken {
  const now = Date.now();
  return {
    token: generateSessionToken(),
    userId,
    createdAt: now,
    expiresAt: now + DEFAULT_TTL_MS,
  };
}

export function validateSessionToken(token: string): boolean {
  if (typeof token !== "string" || token.length !== TOKEN_BYTES * 2) {
    return false;
  }
  return /^[0-9a-f]+$/.test(token);
}

export function isSessionExpired(session: SessionToken): boolean {
  return Date.now() > session.expiresAt;
}

export function isSessionValid(session: SessionToken): boolean {
  return validateSessionToken(session.token) && !isSessionExpired(session);
}
