import { saveSession } from "@/lib/onlineSession";
import { getServerUrl } from "@/lib/serverConfig";
import { normalizeRoomCode } from "@/online/roomCode";

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
