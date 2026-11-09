import type { Player } from "@/types/HexTile";

import { MAX_PLAYERS } from "@server/constants";

/** The side each player has selected, by token. */
export type Sides = Record<string, Player>;

/**
 * Checks if a player is allowed to become ready.
 *
 * The player needs a selected side, and cannot be ready on the same side as another player who is already ready.
 *
 * @param token - The player who wants to be ready.
 * @param sides - The side each player has selected.
 * @param readyTokens - The players who are already ready now.
 * @returns `true` if the player can become ready.
 */
export const canBeReady = (
  token: string,
  sides: Sides,
  readyTokens: ReadonlySet<string>,
): boolean => {
  const side = sides[token];
  if (side === undefined) return false;

  for (const other of readyTokens)
    if (other !== token && sides[other] === side) return false;
  return true;
};

/**
 * Checks if a game can start:
 * - The room is full.
 * - Every player is ready.
 *
 * @param tokens - Every player in the room.
 * @param readyTokens - The players who are ready.
 * @returns `true` if the game can start.
 */
export const everyoneReady = (
  tokens: readonly string[],
  readyTokens: ReadonlySet<string>,
): boolean =>
  tokens.length >= MAX_PLAYERS &&
  tokens.every((token) => readyTokens.has(token));
