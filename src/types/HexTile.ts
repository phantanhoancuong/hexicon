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
  uninitialized: "bg-tile-uninitialized text-transparent",
  neutral: "bg-tile-neutral text-tile-neutral-foreground",
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
  1: "border-sky-600 bg-sky-600 text-white",
  2: "border-rose-600 bg-rose-600 text-white",
};

export const PLAYER_TAG_IDLE_CLASS: Record<Player, string> = {
  1: "border-sky-600 bg-transparent text-sky-600",
  2: "border-rose-600 bg-transparent text-rose-600",
};
