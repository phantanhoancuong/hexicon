import { ClientMessage } from "@/types/Online";

const MAX_TOKEN_LENGTH = 64;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
