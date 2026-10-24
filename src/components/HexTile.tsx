"use client";

import type { ReactNode } from "react";

import Icon from "@/components/Icon";

import { crown } from "@/icons";

import { HexCoord, HexTileData } from "@/types/HexTile";

export const HEX_WIDTH = 48;

const HEX_HEIGHT = (Math.sqrt(3) / 2) * HEX_WIDTH;

const HEX_CLIP =
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/** Capitals show a crown icon, neutral tiles show a letter,  owned and unintialized tiles are blank. */
const getLabel = (tile: HexTileData): ReactNode => {
  if (tile.isCapital) {
    return <Icon src={crown} className="h-1/2 w-1/2" alt="" />;
  }

  if (tile.status === "neutral") return tile.character;
  return "";
};

type HexTileProps = {
  tile: HexTileData;
  /** Tailwind classes for the tile's background and text color. */
  colorClass: string;
  /** Called with the tile's coordinate when it is clicked. */
  onSelect: (coord: HexCoord) => void;
};

/** One clickable hexagon tile on the grid. */
export default function HexTile({ tile, colorClass, onSelect }: HexTileProps) {
  return (
    <button
      className={`${colorClass} ${tile.status === "neutral" ? `cursor-pointer` : ``} flex items-center justify-center transition select-none`}
      style={{ width: HEX_WIDTH, height: HEX_HEIGHT, clipPath: HEX_CLIP }}
      onClick={() => onSelect(tile.coord)}
      aria-label={tile.isCapital ? `Player ${tile.status} capital` : undefined}
    >
      {getLabel(tile)}
    </button>
  );
}
