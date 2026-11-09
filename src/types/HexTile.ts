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
