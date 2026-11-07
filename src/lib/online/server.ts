import { saveSession } from "@/lib/online/session";
import { normalizeRoomCode } from "@/online/roomCode";

/**
 * Reads the game server's address from `NEXT_PUBLIC_GAME_SERVER_URL`.
 *
 * @returns The address without a trailing slash.
 * @throws If the variable is not set.
 */
export const getServerUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_GAME_SERVER_URL;
  if (!url) throw new Error("NEXT_PUBLIC_GAME_SERVER_URL is not set.");
  return url.replace(/\/+$/, "");
};

/** The game server's host and port, such as `127.0.0.1:8787`. */
export const getServerHost = (): string => new URL(getServerUrl()).host;

/** If the game server is reached over HTTPS, so sockets must use `wss`. */
export const isServerSecure = (): boolean =>
  new URL(getServerUrl()).protocol === "https:";

/**
 * Asks the server for a new room and remembers it as the current online game.
 *
 * @returns The code of the new room.
 * @throws If the server cannot be reached or does not answer with a valid code.
 */
export const createRoom = async (): Promise<string> => {
  const response = await fetch(`${getServerUrl()}/rooms`, { method: "POST" });
  if (!response.ok) throw new Error("Could not create a room.");

  const data: unknown = await response.json();
  const code =
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof data.code === "string"
      ? normalizeRoomCode(data.code)
      : null;
  if (code === null) throw new Error("The server sent an invalid room code.");

  saveSession({ code, token: null });
  return code;
};
