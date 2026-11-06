import { normalizeRoomCode } from "@/online/roomCode";

const STORAGE_KEY = "hexicon:online";

export type OnlineSession = {
  code: string;
  token: string | null;
};

export const loadSession = (): OnlineSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;

    const { code, token } = data as Record<string, unknown>;
    if (typeof code !== "string") return null;

    const normalized = normalizeRoomCode(code);
    if (normalized === null) return null;

    if (token !== null && typeof token !== "string") return null;
    return { code: normalized, token };
  } catch {
    return null;
  }
};

export const saveSession = (session: OnlineSession): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
};

export const clearSession = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
};
