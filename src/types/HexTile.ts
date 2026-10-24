export type Player = 1 | 2;

export type TileStatus = "uninitialized" | "neutral" | Player;

export type Highlight = "none" | "selected" | "capturable";

export type HexCoord = {
  q: number;
  r: number;
};

export type HexTileData = {
  coord: HexCoord;
  character: string;
  isCapital: boolean;
  status: TileStatus;
};

/** Tile colors by owner or state. */
export const STATUS_CLASS: Record<TileStatus, string> = {
  uninitialized: "bg-zinc-800/50 text-transparent",
  neutral: "bg-stone-100 text-stone-900",
  1: "bg-sky-600 text-white",
  2: "bg-rose-600 text-white",
};

/** Selected tiles that would be captured, in the current player's color. */
export const CAPTURABLE_CLASS: Record<Player, string> = {
  1: "bg-sky-400 text-white",
  2: "bg-rose-400 text-white",
};

/** Selected tiles that would not be captured. */
export const SELECTED_CLASS = "bg-stone-400 text-stone-900";

/** Enemy tiles that would turn `neutral` if the move is played. */
export const THREATENED_CLASS: Record<Player, string> = {
  1: "bg-sky-400 text-white",
  2: "bg-rose-400 text-white",
};

/** Player labels in `Scoreboard`. */
export const PLAYER_TAG_CLASS: Record<Player, string> = {
  1: "bg-sky-600 text-white",
  2: "bg-rose-600 text-white",
};
