import { useCallback, useEffect, useRef, useState } from "react";

import PartySocket from "partysocket";

import { getServerHost, isServerSecure } from "@/lib/online/server";
import { clearSession, loadSession, saveSession } from "@/lib/online/session";
import { CLOSE_REPLACED } from "@/online/closeCodes";

import type { Player } from "@/types/HexTile";
import type { ClientMessage, ServerError, ServerMessage } from "@/types/Online";

/** Connection status to the game room. */
export type ConnectionStatus =
  "connecting" | "joined" | "reconnecting" | "closed";

/**
 * Latest state of the room.
 *
 * Includes the player's info and their opponent's info.
 */
export type RoomView = Extract<ServerMessage, { type: "room" }>;

/** Why the player was denied from letting into a game room. */
export type OnlineError = ServerError | "replaced";

type Controls = { send: (message: ClientMessage) => void; leave: () => void };

/**
 * Connects to an online game room, joins it, and maintains it.
 *
 * The socket tries to reconnect by itself so each time it opens, the hook sends `join` with the generated `token` assigned to this room.
 * so the player can reconnects as the same `Player`.
 *
 * The hook does not proceed when:
 * - `status` is `closed`.
 * - The room is full.
 * - The player has joined from another tab.
 *
 * Note: The state starts over when the component that uses the hook is created again, so give that component `key={code}`.
 *
 * @param code - The room code, or `null` when disconnected.
 * @returns The connection `status`, the latest `room` state, or `error` if the connection is closed.
 */
export const useOnlineRoom = (code: string | null) => {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<RoomView | null>(null);
  const [error, setError] = useState<OnlineError | null>(null);
  const controlsRef = useRef<Controls | null>(null);

  useEffect(() => {
    if (code === null) return;

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

    controlsRef.current = {
      send: sendMessage,
      leave: () => {
        sendMessage({ type: "leave" });
        clearSession();
        stopped = true;
        socket.close();
      },
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
      controlsRef.current = null;
      socket.close();
    };
  }, [code]);

  const chooseSide = useCallback((side: Player | null) => {
    controlsRef.current?.send({ type: "choose-side", side });
  }, []);

  const setReady = useCallback((ready: boolean) => {
    controlsRef.current?.send({ type: "set-ready", ready });
  }, []);

  const leave = useCallback(() => {
    controlsRef.current?.leave();
  }, []);

  return { status, room, error, chooseSide, setReady, leave };
};
