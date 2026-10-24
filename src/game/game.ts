import { HexCoord, HexTileData, Player } from "@/types/HexTile";

import {
  coordToKey,
  getNeighbors,
  getTile,
  hexDistance,
  keyToCoord,
  setTile,
} from "@/game/hex";

import {
  CAPITAL_COORDS,
  COLUMN_HEIGHTS,
  LETTER_POOL,
  PLAYERS,
} from "@/game/constants";

export type SubmitResult = {
  grid: HexTileData[][];
  extraTurn: boolean;
  lostCapitalPlayers: Set<Player>;
};

export type GameResult = { over: false } | { over: true; winner: Player };

/**
 * Picks a random letter on a weighted frequency scale.
 *
 * @returns A single uppercase letter.
 */
export const pickRandomLetter = (): string =>
  LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)];

/**
 * Assigns every neutral tile a new random letter.
 *
 * @param grid - Current hex grid state.
 * @returns A new grid. Tiles that are not `neutral` are unmodified.
 */
export const randomizeNeutral = (grid: HexTileData[][]): HexTileData[][] =>
  grid.map((column) =>
    column.map((tile) =>
      tile.status === "neutral"
        ? { ...tile, character: pickRandomLetter() }
        : tile,
    ),
  );

/**
 * Finds whose turn follows a player's.
 *
 *
 * @param player - The player who just moved.
 * @returns The next player in turn order.
 */
export const nextPlayer = (player: Player): Player =>
  PLAYERS[(PLAYERS.indexOf(player) + 1) % PLAYERS.length];

/**
 * Whether a tile can be part of a selection. Only `neutral` tiles can be selected.
 *
 * @param tile - The tile to check.
 * @returns `true` if the tile can be selected.
 */
export const isSelectable = (tile: HexTileData): boolean =>
  tile.status === "neutral";

/**
 * Creates the starting grid: every tile is unintialized except each player's capital as well as the capital's neighbors (`neutral`).
 *
 * @returns A starting grid (no assigned letters).
 */
export const initHexGrid = (): HexTileData[][] => {
  const grid = COLUMN_HEIGHTS.map((height, column) =>
    Array.from({ length: height }, (_, i): HexTileData => ({
      coord: { q: column, r: i - Math.ceil(column / 2) },
      character: "",
      status: "uninitialized",
      isCapital: false,
    })),
  );

  const placeCapital = (coord: HexCoord, player: Player) => {
    setTile(grid, coord, { isCapital: true, status: player });
    for (const neighbor of getNeighbors(grid, coord)) {
      if (getTile(grid, neighbor)!.status === "uninitialized")
        setTile(grid, neighbor, { status: "neutral" });
    }
  };

  for (const player of PLAYERS) placeCapital(CAPITAL_COORDS[player], player);

  return grid;
};

/**
 * Finds which selected tiles would be captured.
 *
 * Selected tiles form islands (connected through neighbors). An island is considered capturable if one of its tiles touches `player`'s territory.
 *
 * All tiles within a capturable island become capturable regardless of whether they touch `player`'s territory directly.
 *
 * @param grid - Current hex grid state.
 * @param selectedKeys - Keys of the tiles the player picked.
 * @param player - The player making the move.
 * @return Keys of the selected tiles belonging to a capturable island.
 */
export const getCapturableKeys = (
  grid: HexTileData[][],
  selectedKeys: Set<string>,
  player: Player,
): Set<string> => {
  const visitedKeys = new Set<string>();
  const capturableKeys = new Set<string>();

  for (const selectedKey of selectedKeys) {
    if (visitedKeys.has(selectedKey)) continue;

    const stack: string[] = [selectedKey];
    const island: string[] = [];
    let touchesPlayer = false;
    visitedKeys.add(selectedKey);

    while (stack.length > 0) {
      const currentKey = stack.pop()!;
      island.push(currentKey);

      for (const neighbor of getNeighbors(grid, keyToCoord(currentKey))) {
        if (getTile(grid, neighbor)!.status === player) touchesPlayer = true;

        const neighborKey = coordToKey(neighbor);
        if (visitedKeys.has(neighborKey) || !selectedKeys.has(neighborKey)) {
          continue;
        }

        visitedKeys.add(neighborKey);
        stack.push(neighborKey);
      }
    }

    if (touchesPlayer) island.forEach((key) => capturableKeys.add(key));
  }

  return capturableKeys;
};
/**
 * Finds the tiles that a capture would turn neutral: Tiles next to a captured tile that belong to another player or are `unintialized`.
 *
 * @param grid - Current hex grid state.
 * @param capturableKeys - Keys of the tiles being captured.
 * @param player - The player making the move.
 * @returns Keys of the tiles that would become `neutral`.
 */
export const getNeutralizedKeys = (
  grid: HexTileData[][],
  capturableKeys: Set<string>,
  player: Player,
): Set<string> => {
  const keys = new Set<string>();

  for (const capturableKey of capturableKeys) {
    for (const neighbor of getNeighbors(grid, keyToCoord(capturableKey))) {
      const neighborKey = coordToKey(neighbor);
      if (capturableKeys.has(neighborKey)) continue;

      const { status } = getTile(grid, neighbor)!;
      if (status !== player && status !== "neutral") keys.add(neighborKey);
    }
  }

  return keys;
};

/**
 * Applies a submitted move to a copy of the grid.
 *
 * Captured tiles go to `player`. Enemy and uninitialized tiles next to a captured tile become `neutral` with a new letter assigned. Selected tile but are not capturable also get a new letter assigned.
 *
 * @param grid - Current hex grid state.
 * @param selectedKeys - Keys of the tiles the player picked.
 * @param capturableKeys - Subset of `selectedKeys` connected to the `player`'s territory.
 * @param player - The player making the move.
 * @returns The new grid, if the move earns an extra turn (a capital was captured) and which players lost a capital.
 */
export const resolveSubmit = (
  grid: HexTileData[][],
  selectedKeys: Set<string>,
  capturableKeys: Set<string>,
  player: Player,
): SubmitResult => {
  const newGrid = grid.map((column) => [...column]);
  const lostCapitalPlayers = new Set<Player>();

  for (const key of getNeutralizedKeys(grid, capturableKeys, player)) {
    const coord = keyToCoord(key);
    const tile = getTile(grid, coord)!;
    if (tile.isCapital && typeof tile.status === "number") {
      lostCapitalPlayers.add(tile.status);
    }
    setTile(newGrid, coord, {
      status: "neutral",
      character: pickRandomLetter(),
      isCapital: false,
    });
  }

  for (const key of capturableKeys) {
    setTile(newGrid, keyToCoord(key), { status: player, character: "" });
  }

  for (const key of selectedKeys) {
    if (capturableKeys.has(key)) continue;
    setTile(newGrid, keyToCoord(key), { character: pickRandomLetter() });
  }

  return {
    grid: newGrid,
    extraTurn: lostCapitalPlayers.size > 0,
    lostCapitalPlayers,
  };
};

/** Smallest distasnce from `from` to any of the target tiles (`Infinity` if none). */
const minDistance = (from: HexCoord, targets: HexTileData[]): number =>
  targets.reduce(
    (min, target) => Math.min(min, hexDistance(from, target.coord)),
    Infinity,
  );

/**
 * Picks the safest tile for a player's new capital/
 *
 * A capital is lost when a tile next to it is captured.
 *
 * So a simple heuristics is used: The tile deepest inside the `player`'s territory, farthest from any tile that they don't own is probably the safest one.
 *
 * Ties go to the tile farthest from enemy tiles, then go to the first tile found.
 *
 * @param grid - Current hex grid state.
 * @param player - The player who needs a capital.
 * @returns The chosen coordinate, or `null` if the player lost all of their tiles.
 */
export const findCapitalSite = (
  grid: HexTileData[][],
  player: Player,
): HexCoord | null => {
  const owned: HexTileData[] = [];
  const notOwned: HexTileData[] = [];
  const enemies: HexTileData[] = [];

  for (const column of grid) {
    for (const tile of column) {
      if (tile.status === player) owned.push(tile);
      else {
        notOwned.push(tile);
        if (typeof tile.status === "number") enemies.push(tile);
      }
    }
  }

  let best: HexCoord | null = null;
  let bestDepth = -Infinity;
  let bestEnemyDistance = -Infinity;

  for (const tile of owned) {
    const depth = minDistance(tile.coord, notOwned);
    const enemyDistance = minDistance(tile.coord, enemies);

    if (
      depth > bestDepth ||
      (depth === bestDepth && enemyDistance > bestEnemyDistance)
    ) {
      best = tile.coord;
      bestDepth = depth;
      bestEnemyDistance = enemyDistance;
    }
  }

  return best;
};

/**
 * Gives a player a new capital on their safest tile.{@link findCapitalSite}
 *
 * @param grid - Current hex grid state.
 * @param player - The player who lost their capital.
 * @returns A copy of the grid with a new capital set, or the same grid if `player` lost all their tiles.
 */
export const reformCapital = (
  grid: HexTileData[][],
  player: Player,
): HexTileData[][] => {
  const site = findCapitalSite(grid, player);
  if (site === null) return grid;

  const newGrid = grid.map((column) => [...column]);
  setTile(newGrid, site, { isCapital: true });
  return newGrid;
};

const ownsAnyTile = (grid: HexTileData[][], player: Player): boolean =>
  grid.some((column) => column.some((tile) => tile.status === player));

/**
 * Decides whether a game is over. It ends when at most one player owns a tile.
 *
 * @param grid - Current hex grid state.
 * @returns `{ over: false} `, or `{ over: true, winner} `.
 */
export const getGameResult = (grid: HexTileData[][]): GameResult => {
  const alive = PLAYERS.filter((player) => ownsAnyTile(grid, player));
  return alive.length > 1 ? { over: false } : { over: true, winner: alive[0] };
};
