import { PLAYERS } from "@/game/constants";
import type { Dictionary } from "@/game/dictionary";
import { applyMove, createGameState, dealState, nextGame } from "@/game/game";
import { getGameResult } from "@/game/grid";

import type { GameState, Move } from "@/types/GameState";

import { TURN_MS } from "@server/constants";
import type { Sides } from "@server/room/lobby";

/** The game of a room, as it is kept in storage. */
export type StoredGame = {
  state: GameState;

  /** When the current turn runs out, in milliseconds. `null` once the game is over. */
  turnEndsAt: number | null;
};

/** Wraps a state with the time its turn runs out, or with no time if the game is over. */
const withTurnClock = (state: GameState, now: number): StoredGame => ({
  state,
  turnEndsAt: getGameResult(state.grid).over ? null : now + TURN_MS,
});

/**
 * Checks if a game is being played right now.
 *
 * @param game - The game of the room, or `null` if none has started.
 * @returns `false` if there is no game, or if it is over.
 */
export const isRunning = (game: StoredGame | null): boolean =>
  game !== null && game.turnEndsAt !== null;

/**
 * Starts a game.
 *
 * The first game starts with Player 1.
 * The next game starts on a fresh board with the same wins and the same starting player.
 *
 * @param previous - The game that has finished in this room, or `null` if there is none.
 * @param dictionary - Used to deal letters.
 * @param now - The time now, in milliseconds.
 * @returns The new game.
 */
export const startGame = (
  previous: StoredGame | null,
  dictionary: Dictionary,
  now: number,
): StoredGame =>
  withTurnClock(
    previous === null
      ? dealState(createGameState(PLAYERS[0]), dictionary)
      : nextGame(previous.state, dictionary, false),
    now,
  );

/**
 * Checks if it is a player's turn.
 *
 * @param game - The game.
 * @param sides - The side each player has selected.
 * @param token - The player.
 * @returns `true` if the game is running and the player has the side whose turn it is.
 */
export const isTurnOf = (
  game: StoredGame,
  sides: Sides,
  token: string,
): boolean =>
  game.turnEndsAt !== null && sides[token] === game.state.currentPlayer;

/**
 * Applies a move and starts the clock of the next turn.
 *
 * @param game - The game before the move.
 * @param move - The move of the current player.
 * @param dictionary - Used to check words and to deal letters.
 * @param now - The time now, in milliseconds.
 * @returns The game after the move, or `null` if the move was refused.
 */
export const playMove = (
  game: StoredGame,
  move: Move,
  dictionary: Dictionary,
  now: number,
): StoredGame | null => {
  const result = applyMove(game.state, move, dictionary);
  return result.ok ? withTurnClock(result.state, now) : null;
};

/**
 * Passes the turn if the current player has run out of time.
 *
 * @param game - The game.
 * @param dictionary - Used to deal letters.
 * @param now - The time now, in milliseconds.
 * @returns The game after the pass, or `game` itself if the turn has not run out.
 */
export const expireTurn = (
  game: StoredGame,
  dictionary: Dictionary,
  now: number,
): StoredGame => {
  if (game.turnEndsAt === null || now < game.turnEndsAt) return game;
  return (
    playMove(game, { type: "pass", reason: "timeout" }, dictionary, now) ?? game
  );
};

/**
 * How long until the turn runs out.
 *
 * @param game - The game.
 * @param now - The time now, in milliseconds.
 * @returns The milliseconds left, or `null` if the game is over.
 */
export const msUntilTurnEnds = (
  game: StoredGame,
  now: number,
): number | null =>
  game.turnEndsAt === null ? null : Math.max(0, game.turnEndsAt - now);
