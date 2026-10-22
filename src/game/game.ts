import { HexCellData, HexCoord, Player } from "@/types/HexCell";

import {
  coordToKey,
  getCell,
  getNeighbors,
  hexDistance,
  keyToCoord,
  setCell,
} from "@/game/hex";

import {
  CAPITAL_COORDS,
  COLUMN_HEIGHTS,
  LETTER_POOL,
  PLAYERS,
} from "@/game/constants";

type SubmitResult = {
  board: HexCellData[][];
  extraTurn: boolean;
  lostCapitalPlayers: Set<Player>;
};

/**
 * Find which selected cells would be captured.
 *
 * Selected cells form islands (connected through neighbors). An island is considered capturable if one of its cells touches `player`'s territory.
 * All cells within a capturable island become capturable regardless of whether they touch `player`'s territory directly.
 *
 * @param board - Current board state.
 * @param selectedKeys - Keys of the cells the player picked.
 * @param player - The player making the move.
 * @return Keys of the selected cells belonging to a capturable island.
 */
export const getCapturableKeys = (
  board: HexCellData[][],
  selectedKeys: Set<string>,
  player: Player,
): Set<string> => {
  const visitedKeys = new Set<string>();
  const capturableKeys = new Set<string>();

  for (const selectedKey of selectedKeys) {
    if (visitedKeys.has(selectedKey)) continue;

    const stack: string[] = [selectedKey];
    const island: string[] = [];
    let touchesPlayer: boolean = false;

    while (stack.length > 0) {
      const currentKey = stack.pop()!;
      island.push(currentKey);

      const currentCoord = keyToCoord(currentKey);
      for (const neighborCoord of getNeighbors(board, currentCoord)) {
        if (!touchesPlayer && getCell(board, neighborCoord)!.status === player)
          touchesPlayer = true;
        const neighborKey = coordToKey(neighborCoord);

        if (visitedKeys.has(neighborKey) || !selectedKeys.has(neighborKey))
          continue;

        visitedKeys.add(neighborKey);
        stack.push(neighborKey);
      }
    }

    if (touchesPlayer) island.forEach((item) => capturableKeys.add(item));
  }

  return capturableKeys;
};

export const pickRandomLetter = (): string =>
  LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)];

/**
 * Apply a submitted move to a copy of the board and return the copy.
 *
 * Captured cells go to `player`.
 * Opponent and uninitialized cells next to a captured cell become neutral.
 * Selected cells not capturable get a new letter.
 *
 * @param board - Current board state.
 * @param selectedKeys - Keys of the cells the player picked.
 * @param capturableKeys - Subset of `selectedKeys` are connected to `player`'s territory.
 * @param player - The player making the move.
 * @returns The new board, and if the move gets an extra turn.
 */
export const resolveSubmit = (
  board: HexCellData[][],
  selectedKeys: Set<string>,
  capturableKeys: Set<string>,
  player: Player,
): SubmitResult => {
  const newBoard = board.map((column) => [...column]);
  const lostCapitalPlayers = new Set<Player>();

  for (const key of getNeutralizedKeys(board, capturableKeys, player)) {
    const coord = keyToCoord(key);
    const cell = getCell(board, coord)!;
    if (cell.isCapital && typeof cell.status === "number") {
      lostCapitalPlayers.add(cell.status);
    }
    setCell(newBoard, coord, {
      status: "neutral",
      character: pickRandomLetter(),
      isCapital: false,
    });
  }

  for (const key of capturableKeys) {
    setCell(newBoard, keyToCoord(key), { status: player, character: "" });
  }

  for (const key of selectedKeys) {
    if (capturableKeys.has(key)) continue;
    setCell(newBoard, keyToCoord(key), { character: pickRandomLetter() });
  }

  return {
    board: newBoard,
    extraTurn: lostCapitalPlayers.size > 0,
    lostCapitalPlayers,
  };
};

export const isSelectable = (cell: HexCellData): boolean =>
  cell.status === "neutral";

export const initHexBoard = (): HexCellData[][] => {
  const board = COLUMN_HEIGHTS.map((height, column) =>
    Array.from({ length: height }, (_, i): HexCellData => ({
      coord: { q: column, r: i - Math.ceil(column / 2) },
      character: "",
      status: "uninitialized",
      isCapital: false,
    })),
  );

  const placeCapital = (coord: HexCoord, player: Player) => {
    setCell(board, coord, { isCapital: true, status: player });
    for (const neighbor of getNeighbors(board, coord)) {
      if (getCell(board, neighbor)!.status === "uninitialized")
        setCell(board, neighbor, { status: "neutral" });
    }
  };

  for (const player of PLAYERS) placeCapital(CAPITAL_COORDS[player], player);

  return board;
};

const ownsAnyCell = (board: HexCellData[][], player: Player): boolean =>
  board.some((column) => column.some((cell) => cell.status === player));

export type GameResult = { over: false } | { over: true; winner: Player };

export const getGameResult = (board: HexCellData[][]): GameResult => {
  const alive = PLAYERS.filter((player) => ownsAnyCell(board, player));
  return alive.length > 1 ? { over: false } : { over: true, winner: alive[0] };
};

export const randomizeNeutral = (board: HexCellData[][]): HexCellData[][] =>
  board.map((column) =>
    column.map((cell) =>
      cell.status === "neutral"
        ? { ...cell, character: pickRandomLetter() }
        : cell,
    ),
  );

export const nextPlayer = (player: Player): Player =>
  PLAYERS[(PLAYERS.indexOf(player) + 1) % PLAYERS.length];

const minDistance = (from: HexCoord, targets: HexCellData[]): number =>
  targets.reduce(
    (min, target) => Math.min(min, hexDistance(from, target.coord)),
    Infinity,
  );

export const findCapitalSite = (
  board: HexCellData[][],
  player: Player,
): HexCoord | null => {
  const owned: HexCellData[] = [];
  const notOwned: HexCellData[] = [];
  const enemies: HexCellData[] = [];

  for (const column of board) {
    for (const cell of column) {
      if (cell.status === player) owned.push(cell);
      else {
        notOwned.push(cell);
        if (typeof cell.status === "number") enemies.push(cell);
      }
    }
  }

  let best: HexCoord | null = null;
  let bestDepth = -Infinity;
  let bestEnemyDistance = -Infinity;

  for (const cell of owned) {
    const depth = minDistance(cell.coord, notOwned);
    const enemyDistance = minDistance(cell.coord, enemies);

    if (
      depth > bestDepth ||
      (depth === bestDepth && enemyDistance > bestEnemyDistance)
    ) {
      best = cell.coord;
      bestDepth = depth;
      bestEnemyDistance = enemyDistance;
    }
  }

  return best;
};

export const reformCapital = (
  board: HexCellData[][],
  player: Player,
): HexCellData[][] => {
  const site = findCapitalSite(board, player);
  if (site === null) return board;

  const newBoard = board.map((column) => [...column]);
  setCell(newBoard, site, { isCapital: true });
  return newBoard;
};

export const getNeutralizedKeys = (
  board: HexCellData[][],
  capturableKeys: Set<string>,
  player: Player,
): Set<string> => {
  const keys = new Set<string>();

  for (const capturableKey of capturableKeys) {
    for (const neighbor of getNeighbors(board, keyToCoord(capturableKey))) {
      const neighborKey = coordToKey(neighbor);
      if (capturableKeys.has(neighborKey)) continue;

      const { status } = getCell(board, neighbor)!;
      if (status !== player && status !== "neutral") keys.add(neighborKey);
    }
  }

  return keys;
};
