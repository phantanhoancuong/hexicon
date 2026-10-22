import { NEIGHBOR_OFFSETS } from "@/game/constants";

import { HexCellData, HexCoord } from "@/types/HexCell";

export const coordToKey = (coord: HexCoord): string => `${coord.q},${coord.r}`;

export const keyToCoord = (key: string): HexCoord => {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
};

export const coordToIndex = (coord: HexCoord): number =>
  coord.r + Math.ceil(coord.q / 2);

export const getCell = (
  board: HexCellData[][],
  coord: HexCoord,
): HexCellData | undefined => board[coord.q]?.[coordToIndex(coord)];

export const setCell = (
  board: HexCellData[][],
  coord: HexCoord,
  patch: Partial<HexCellData>,
): void => {
  const cell = getCell(board, coord);
  if (!cell) return;

  board[coord.q][coordToIndex(coord)] = { ...cell, ...patch };
};

export const getNeighbors = (
  board: HexCellData[][],
  coord: HexCoord,
): HexCoord[] =>
  NEIGHBOR_OFFSETS.map((o) => ({ q: coord.q + o.q, r: coord.r + o.r })).filter(
    (c) => getCell(board, c) !== undefined,
  );

export const hexDistance = (a: HexCoord, b: HexCoord): number => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
};
