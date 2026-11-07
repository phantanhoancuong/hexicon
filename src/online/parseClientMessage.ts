import { ClientMessage } from "@/types/Online";

/** Longest token accepted. */
const MAX_TOKEN_LENGTH = 64;

/** If a value is a plain object (not `null` and not an array). */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
    default:
      return null;
  }
};
