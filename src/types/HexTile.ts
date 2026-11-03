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
  1: "bg-player-1 text-white",
  2: "bg-player-2 text-white",
};

/** Selected tiles that would be captured, in the current player's color. */
export const CAPTURABLE_CLASS: Record<Player, string> = {
  1: "bg-player-1-soft text-stone-900",
  2: "bg-player-2-soft text-stone-900",
};

/** Selected tiles that would not be captured. */
export const SELECTED_CLASS = "bg-stone-400 text-stone-900";

/** Enemy tiles that would turn `neutral` if the move is played. */
export const THREATENED_CLASS: Record<Player, string> = {
  1: "bg-player-1-soft text-stone-900",
  2: "bg-player-2-soft text-stone-900",
};

/** A player's solid color, used for the bar in `PlayerTag` and the winner badge in `GameOverDialog`. */
export const PLAYER_TAG_CLASS: Record<Player, string> = {
  1: "bg-player-1 text-white",
  2: "bg-player-2 text-white",
};
