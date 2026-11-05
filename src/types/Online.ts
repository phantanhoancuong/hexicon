/** Whether a player is making a new game room or joining an existing one. */
export type JoinIntent = "create" | "join";

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
   * If the token matches a player in the room, they are let back in as that player and `intent` is ignored.
   */
  {
    type: "join";
    intent: JoinIntent;
    token: string | null;
  };

export type ServerError =
  /** `join` a game room that hasn't been created. */
  | "room-not-found"
  /** `join` a game that is already full. */
  | "room-full"
  /** The message could not be understood. */
  | "invalid-message";

export type ServerMessage =
  /**
   * `token` is stored by the browser, `token` is used to `join` a game room.
   */
  | { type: "welcome"; token: string }
  /**
   * Current state of the room, sent:
   * - When a player joins, disconnects, or comes back to the room.
   * - After `welcome`.
   */
  | { type: "room"; self: PlayerInfo; opponent: PlayerInfo | null }
  | { type: "error"; reason: ServerError };
