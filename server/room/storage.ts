import type { TurnSeconds } from "@/game/constants";
import { DEFAULT_ALTERNATE, TURN_SECONDS } from "@/game/constants";

import type { Sides } from "@server/room/lobby";
import type { StoredGame } from "@server/room/turn";

/** A stored value for a game room. */
export type Entry<T> = {
  /** The stored value, or the entry's default value. */
  get: () => Promise<T>;
  set: (value: T) => Promise<void>;
  /** Removes the stored value, so `get()` would return the default value. */
  remove: () => Promise<void>;
};

/**
 * Creates the storage of a game room.
 *
 * @param storage - The storage of the room's Durable Object.
 * @returns The room's entries, and `clear()` function to remove all the entries.
 */
export const createRoomStorage = (storage: DurableObjectStorage) => {
  /**
   * Makes a room's storage entry.
   *
   * @param key - The key the value is stored under.
   * @param makeDefault - Returns the entry's default value. This is a function so any call would return a new array or object.
   * @returns The entry.
   */
  const entry = <T>(key: string, makeDefault: () => T): Entry<T> => ({
    get: async () => (await storage.get<T>(key)) ?? makeDefault(),
    set: (value) => storage.put(key, value),
    remove: async () => {
      await storage.delete(key);
    },
  });

  return {
    /** If the room was made by `POST /rooms`. */
    created: entry<boolean>("created", () => false),

    /** The tokens of the players in the room, in join order. */
    tokens: entry<string[]>("tokens", () => []),

    /** The sides each player has taken, by token. */
    sides: entry<Sides>("sides", () => ({})),

    /** If the player who goes first alternates between matches. */
    alternate: entry<boolean>("alternate", () => DEFAULT_ALTERNATE),

    /** How long a turn lasts, in seconds. */
    turnSeconds: entry<TurnSeconds>("turnSeconds", () => TURN_SECONDS),

    /** The state of the game being played in the room, `null` if no game is being played. */
    game: entry<StoredGame | null>("game", () => null),

    /** Removes everything in the room's storage. */
    clear: () => storage.deleteAll(),
  };
};
