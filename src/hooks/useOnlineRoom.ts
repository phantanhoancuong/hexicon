import PartySocket from "partysocket";
import { useEffect, useState } from "react";

import { clearSession, loadSession, saveSession } from "@/lib/onlineSession";
import { getServerHost, isServerSecure } from "@/lib/serverConfig";
import { CLOSE_REPLACED } from "@/online/closeCodes";
import type { ClientMessage, ServerError, ServerMessage } from "@/types/Online";

export type ConnectionStatus =
  "connecting" | "joined" | "reconnecting" | "closed";

export type RoomView = Extract<ServerMessage, { type: "room" }>;

export type OnlineError = ServerError | "replaced";

export const useOnlineRoom = (code: string | null) => {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<RoomView | null>(null);
  const [error, setError] = useState<OnlineError | null>(null);

  useEffect(() => {
    if (code === null) return;

    setStatus("connecting");
    setRoom(null);
    setError(null);

    let stopped = false;

    const socket = new PartySocket({
      host: getServerHost(),
      protocol: isServerSecure() ? "wss" : "ws",
      party: "main",
      room: code,
    });

    const sendMessage = (message: ClientMessage) =>
      socket.send(JSON.stringify(message));

    const stop = (reason: OnlineError) => {
      stopped = true;
      setError(reason);
      setStatus("closed");
      socket.close();
    };

    socket.addEventListener("open", () => {
      if (stopped) return;
      const session = loadSession();
      const token = session?.code === code ? session.token : null;
      sendMessage({ type: "join", token });
    });

    socket.addEventListener("message", (event) => {
      if (stopped) return;

      let message: ServerMessage;
      try {
        message = JSON.parse(String(event.data)) as ServerMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case "welcome":
          saveSession({ code, token: message.token });
          setStatus("joined");
          return;
        case "room":
          setRoom(message);
          return;
        case "error":
          if (
            message.reason === "room-not-found" ||
            message.reason === "room-full"
          ) {
            clearSession();
            stop(message.reason);
          } else {
            setError(message.reason);
          }
          return;
      }
    });

    socket.addEventListener("close", (event) => {
      if (stopped) return;
      if (event.code === CLOSE_REPLACED) {
        stop("replaced");
        return;
      }
      setStatus("reconnecting");
    });

    return () => {
      stopped = true;
      socket.close();
    };
  }, [code]);

  return { status, room, error };
};
