import { PLAYERS } from "@/game/constants";
import { Dictionary } from "@/game/dictionary";
import {
  dealNeutral,
  ensurePlayable,
  getCapturableKeys,
  getGameResult,
  initHexGrid,
  isSelectable,
  nextPlayer,
  reformCapital,
  resolveSubmit,
} from "@/game/grid";
import { getTile, keyToCoord } from "@/game/hex";

import { GameEvent } from "@/types/GameEvent";
import {
  GameState,
  Move,
  MoveError,
  MoveResult,
  PassReason,
} from "@/types/GameState";
import { HexTileData, Player } from "@/types/HexTile";

type TurnStart = Pick<GameState, "grid" | "pendingCapitals" | "events">;

/**
 * Creates the default state of a new match (the neutral tiles don't have any letters yet).
 *
 * @param starter - The player who moves first. Defaults to the first player.
 * @returns The starting state.
 */
export const createGameState = (starter: Player = PLAYERS[0]): GameState => ({
  grid: initHexGrid(),
  turn: 1,
  currentPlayer: starter,
  starter,
  wins: { 1: 0, 2: 0 },
  pendingCapitals: [],
  firstPasser: null,
  events: [],
});

/**
 * Deals letters onto the neutral tiles of a state.
 *
 * @param state - The state to deal into.
 * @param dictionary - Used to plant a word in the dealt letters.
 * @returns A copy of the state with new letters.
 */
export const dealState = (
  state: GameState,
  dictionary: Dictionary,
): GameState => ({ ...state, grid: dealNeutral(state.grid, dictionary) });

/**
 * Starts the next game on a fresh board, while keeping the win counts.
 *
 * @param state - The state of the game that ended.
 * @param dictionary - Used to deal letters.
 * @param alternate - Whether the first move alternates between games. If not, the same player starts again.
 * @returns The state of the new game.
 */
export const nextGame = (
  state: GameState,
  dictionary: Dictionary,
  alternate: boolean,
): GameState => {
  const starter = alternate ? nextPlayer(state.starter) : state.starter;

  return {
    ...dealState(createGameState(starter), dictionary),
    wins: state.wins,
  };
};

/**
 * Hands the turn a player.
 *
 * If the player a lost their capital, a new one is reformed for them.
 *
 * @param grid - The hex grid before the player's turn starts.
 * @param pendingCapitals - Players who lost their capital.
 * @param player - The player whose turn is starting.
 * @returns The grid (with a new capital if needed), the players that still need a new capital, and new event notices.
 */
const enterTurn = (
  grid: HexTileData[][],
  pendingCapitals: Player[],
  player: Player,
): TurnStart => {
  const reformed = pendingCapitals.includes(player);

  return {
    grid: reformed ? reformCapital(grid, player) : grid,
    pendingCapitals: pendingCapitals.filter((p) => p !== player),
    events: reformed ? [{ type: "capital-reformed", player }] : [],
  };
};

/** A refused move. */
const refuse = (reason: MoveError): MoveResult => ({ ok: false, reason });

/**
 * Plays a word for the current player:
 * 1. Refuses the move if the tiles or the word are not valid.
 * 2. Captures the eligible tiles, and records a win if this move ends the game.
 * 3. Picks the next player.
 * 4. Gives that player a new capital if theirs was destroyed.
 * 5. Redeals the letters if no valid word can be played.
 *
 * @param state - The state before the move.
 * @param keys - Keys of the selected tiles, in word order.
 * @param dictionary - Used to check the word and to redeal.
 * @returns The state after the move, or why the move was refused.
 */
const applySubmit = (
  state: GameState,
  keys: string[],
  dictionary: Dictionary,
): MoveResult => {
  if (keys.length === 0) return refuse("empty-selection");

  const selectedKeys = new Set(keys);
  if (selectedKeys.size !== keys.length) return refuse("invalid-tiles");

  const tiles: HexTileData[] = [];
  for (const key of keys) {
    const tile = getTile(state.grid, keyToCoord(key));
    if (!tile || !isSelectable(tile)) return refuse("invalid-tiles");
    tiles.push(tile);
  }

  const word = tiles.map((tile) => tile.character).join("");
  if (!dictionary.has(word)) return refuse("invalid-word");

  const player = state.currentPlayer;
  const capturableKeys = getCapturableKeys(state.grid, selectedKeys, player);
  const { grid, extraTurn, lostCapitalPlayers } = resolveSubmit(
    state.grid,
    selectedKeys,
    capturableKeys,
    player,
  );

  const result = getGameResult(grid);
  const wins = result.over
    ? { ...state.wins, [result.winner]: state.wins[result.winner] + 1 }
    : state.wins;

  const nextToMove = extraTurn ? player : nextPlayer(player);
  const next = enterTurn(
    grid,
    [...new Set([...state.pendingCapitals, ...lostCapitalPlayers])],
    nextToMove,
  );
  const playableGrid = ensurePlayable(next.grid, dictionary);

  const events: GameEvent[] = [
    ...[...lostCapitalPlayers].map((loser): GameEvent => ({
      type: "capital-captured",
      captor: player,
      loser,
    })),
    ...next.events,
  ];
  if (playableGrid !== next.grid) {
    events.push({ type: "redeal", reason: "no-playable-word" });
  }
  events.push({ type: "played", player, word, keys });

  return {
    ok: true,
    state: {
      ...state,
      grid: playableGrid,
      turn: state.turn + 1,
      currentPlayer: nextToMove,
      wins,
      pendingCapitals: next.pendingCapitals,
      firstPasser: null,
      events: result.over ? [] : events,
    },
  };
};

/**
 * Passes the current player's turn:
 * 1. Picks the next player.
 * 2. Gives that player a new capital if theirs was destroyed.
 * 3. Redeals all letters if every player has passed in a row.
 *
 * @param state - The state before the pass.
 * @param reason - Whhy the turn is passed.
 * @param dictionary - Used to redeal letters.
 * @returns The state after the pass.
 */
const applyPass = (
  state: GameState,
  reason: PassReason,
  dictionary: Dictionary,
): GameState => {
  const nextToMove = nextPlayer(state.currentPlayer);
  const opener = state.firstPasser ?? state.currentPlayer;
  const allPassed = nextToMove === opener;
  const next = enterTurn(state.grid, state.pendingCapitals, nextToMove);

  const events: GameEvent[] = [
    { type: reason, player: state.currentPlayer },
    ...next.events,
  ];
  if (allPassed) events.push({ type: "redeal", reason: "all-passed" });

  return {
    ...state,
    grid: allPassed ? dealNeutral(next.grid, dictionary) : next.grid,
    turn: state.turn + 1,
    currentPlayer: nextToMove,
    pendingCapitals: next.pendingCapitals,
    firstPasser: allPassed ? null : opener,
    events,
  };
};

/**
 * Applies a move for the current player.
 *
 * It does NOT change `state`.
 *
 * @param state - The state before the move.
 * @param move - What the current player does.
 * @param dictionary - Used to check words and to deal letters.
 * @returns The state after the move, or why the move was refused.
 */
export const applyMove = (
  state: GameState,
  move: Move,
  dictionary: Dictionary,
): MoveResult => {
  if (getGameResult(state.grid).over) return refuse("game-over");

  return move.type === "submit"
    ? applySubmit(state, move.keys, dictionary)
    : { ok: true, state: applyPass(state, move.reason, dictionary) };
};
