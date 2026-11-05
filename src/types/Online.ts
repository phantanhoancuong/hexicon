export type PlayerInfo = {
  /** `false` while the player is disconnected from the game room. */
  connected: boolean;
};

/** Player's requests to the server. */
export type ClientMessage =
  /**
   * First message after connecting.
   *
   * `token` is `token` from `"welcome" ServerMessage`. It identifies the player when they try to reconnect.
   * If the token matches a player in the room, they are let back in as that player.
   */
  {
    type: "join";
    token: string | null;
  };

export type ServerError =
  /** `join` a game room that hasn't been created. */
  | "room-not-found"
  /** `join` a game room that is already full. */
  | "room-full"
  /** The message could not be understood. */
  | "invalid-message";

export type ServerMessage =
  /**
   * Notifies that the player is in the game room.
   *
   * `token` identifies this player to this game room.
   *
   * The browser stores `token` with the room code, so it can send `join` to reconnect.
   */
  | { type: "welcome"; token: string }
  /**
   * Current state of the room, sent when a player joins, disconnects, or comes back to the room.
   */
  | { type: "room"; self: PlayerInfo; opponent: PlayerInfo | null }
  | { type: "error"; reason: ServerError };
