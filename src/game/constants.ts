import { HexCoord, Player } from "@/types/HexTile";

export const PLAYERS = [1, 2] as const;

/** Number of tiles in each column, from left to right. */
export const COLUMN_HEIGHTS = [6, 7, 6, 7, 6, 7, 6];

export const CAPITAL_COORDS: Record<Player, HexCoord> = {
  1: { q: 1, r: 0 },
  2: { q: 5, r: 2 },
};

/** The six direction offsets to a tile's neighbors. */
export const NEIGHBOR_OFFSETS: readonly HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

/** English Scrabble tile counts, used as simple letter frequencies. */
const LETTER_COUNTS: Record<string, number> = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};

export const LETTER_POOL = Object.entries(LETTER_COUNTS)
  .map(([letter, count]) => letter.repeat(count))
  .join("");

export const TURN_SECONDS = 60;

export const NOTICE_MS = 4000;

export const TURN_PAUSE_MS = 2000;

export const BOT_THINK_MS = 1200;

export const BOT_TILE_MS = 350;

export const BOT_SUBMIT_MS = 600;
