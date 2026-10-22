export type Player = 1 | 2;

export type CellStatus = "uninitialized" | "neutral" | Player;

export type Highlight = "none" | "selected" | "capturable";

export type HexCoord = {
  q: number;
  r: number;
};

export type HexCellData = {
  coord: HexCoord;
  character: string;
  isCapital: boolean;
  status: CellStatus;
};

export const STATUS_CLASS: Record<CellStatus, string> = {
  uninitialized: "bg-zinc-800/50 text-transparent",
  neutral: "bg-stone-100 text-stone-900",
  1: "bg-sky-600 text-white",
  2: "bg-rose-600 text-white",
};

export const CAPTURABLE_CLASS: Record<Player, string> = {
  1: "bg-sky-400 text-white",
  2: "bg-rose-400 text-white",
};

export const SELECTED_CLASS = "bg-stone-400 text-stone-900";

export const THREATENED_CLASS: Record<Player, string> = {
  1: "bg-sky-400 text-white",
  2: "bg-rose-400 text-white",
};

export const PLAYER_TAG_CLASS: Record<Player, string> = {
  1: "bg-sky-600 text-white",
  2: "bg-rose-600 text-white",
};
