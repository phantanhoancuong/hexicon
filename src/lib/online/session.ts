import { normalizeRoomCode } from "@/online/roomCode";

const STORAGE_KEY = "hexicon:online";

/** The online room this browser is in, saved so a refresh can rejoin it. */
export type OnlineSession = {
  code: string;
  /** The identity the server gave this browser in that room, or `null` before the first join. */
  token: string | null;
};

/**
 * Reads the saved session.
 *
 * @returns The session, or `null` if nothing valid is saved or storage is blocked.
 */
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

/** Saves the session, replacing any earlier one. Does nothing if storage is blocked. */
export const saveSession = (session: OnlineSession): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
};

/** Forgets the saved session. Does nothing if storage is blocked. */
export const clearSession = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
};
