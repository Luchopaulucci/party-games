const PREFIX = "previa:v1:";

export interface StoredSession {
  code: string;
  playerId: string;
  token: string;
  name: string;
}

export function sessionKey(code: string): string {
  return `${PREFIX}${code.toUpperCase()}`;
}

export function readSession(code: string): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(sessionKey(code));
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession) {
  localStorage.setItem(sessionKey(session.code), JSON.stringify(session));
}

export function clearSession(code: string) {
  localStorage.removeItem(sessionKey(code));
}

export { configuredSocketUrl as socketUrl } from "@/lib/online";
