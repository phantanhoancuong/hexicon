import { Player } from "@/types/HexTile";
import { ClientMessage } from "@/types/Online";

/** Longest token accepted. */
const MAX_TOKEN_LENGTH = 64;

const MAX_WORD_TILES = 45;
const MAX_KEY_LENGTH = 16;

/** If a value is a plain object (not `null` and not an array). */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** If a value is a valid side. */
const isSide = (value: unknown): value is Player => value === 1 || value === 2;

/** If a value is a list of tile keys. */
const isKeyList = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length <= MAX_WORD_TILES &&
  value.every(
    (key) =>
      typeof key === "string" && key.length > 0 && key.length <= MAX_KEY_LENGTH,
  );

/**
 * Reads a message from a client and validates.
 *
 * @param raw - The text received over the socket.
 * @returns The message, or `null` if it not valid JSON or not a known message.
 */
export const parseClientMessage = (raw: string): ClientMessage | null => {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(data)) return null;

  switch (data.type) {
    case "join": {
      const { token } = data;
      if (token === null) return { type: "join", token: null };
      if (
        typeof token === "string" &&
        token.length > 0 &&
        token.length <= MAX_TOKEN_LENGTH
      ) {
        return { type: "join", token };
      }
      return null;
    }
    case "choose-side": {
      const { side } = data;
      if (side === null || isSide(side)) return { type: "choose-side", side };
      return null;
    }
    case "set-ready": {
      const { ready } = data;
      if (typeof ready === "boolean") return { type: "set-ready", ready };
      return null;
    }
    case "leave":
      return { type: "leave" };
    case "submit": {
      const { keys } = data;
      if (isKeyList(keys)) return { type: "submit", keys };
      return null;
    }
    case "select": {
      const { keys } = data;
      if (isKeyList(keys)) return { type: "select", keys };
      return null;
    }
    default:
      return null;
  }
};
