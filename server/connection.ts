import type { Connection } from "partyserver";

import type { ServerMessage } from "@/types/Online";

/** What is kept on each connection to survive the room going to sleep. */
export type ConnectionState = { token: string; ready: boolean };

/** Sends a message to one connection. */
export const send = (connection: Connection, message: ServerMessage) =>
  connection.send(JSON.stringify(message));

/**
 * Maps player to connection.
 *
 * @param connection - The connection to look up.
 * @returns The player's token, or `null` if the connection has not joined yet.
 */
export const tokenOf = (connection: Connection): string | null => {
  const state = connection.state as Partial<ConnectionState> | null;
  return state?.token ?? null;
};

/** If the player on a connection is ready. */
export const isReady = (connection: Connection): boolean => {
  const state = connection.state as Partial<ConnectionState> | null;
  return state?.ready === true;
};
