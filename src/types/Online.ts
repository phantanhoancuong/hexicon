import { GameState } from "@/types/GameState";
import { Player } from "@/types/HexTile";

export type PlayerInfo = {
  /** `false` while the player is disconnected from the game room. */
  connected: boolean;
  /** The side the player has taken, or `null` they have not set one. */
  side: Player | null;
  /** If the player is ready to start. */
  ready: boolean;
};

/** Player's requests to the server. */
export type ClientMessage =
  /**
   * First message after connecting.
   *
   * `token` is `token` from `"welcome" ServerMessage`. It identifies the player when they try to reconnect.
   * If the token matches a player in the room, they are let back in as that player.
   */
  | {
      type: "join";
      token: string | null;
    }
  /** The player selects a side, or unselects a side (`null`). */
  | { type: "choose-side"; side: Player | null }
  /** The player is marked to be ready to play. */
  | { type: "set-ready"; ready: boolean }
  /** The player leaves the room for good. */
  | { type: "leave" }
  /**
   * The player plays a word spelt by the selected tiles.
   *
   * `keys` are the keys of the tiles, in word order.
   */
  | { type: "submit"; keys: string[] };

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
  | {
      type: "room";
      self: PlayerInfo;
      opponent: PlayerInfo | null;
      inGame: boolean;
    }
  /**
   * Current state of the game, sent when:
   * - A game starts.
   * - After a move.
   * - A player joins or comes back during a game.
   *
   * `you` is the side this player plays.
   * `turnEndsInMs` is how long until the current turn runs out, or `null` when the game is over.
   */
  | { type: "game"; state: GameState; you: Player; turnEndsInMs: number | null }
  | { type: "error"; reason: ServerError };
