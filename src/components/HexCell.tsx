"use client";
import type { ReactNode } from "react";

import { HexCellData, HexCoord } from "@/types/HexCell";

import Icon from "@/components/Icon";

import { crown } from "@/icons";

const getLabel = (cell: HexCellData): ReactNode => {
  if (cell.isCapital) {
    return <Icon src={crown} className="h-1/2 w-1/2" alt="" />;
  }
  if (cell.status === "neutral") return cell.character;
  return "";
};

export const HEX_WIDTH = 48;
const HEX_HEIGHT = (Math.sqrt(3) / 2) * HEX_WIDTH;
const HEX_CLIP =
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

export default function HexCell({
  hexCellData,
  colorClass,
  onSelect,
}: {
  hexCellData: HexCellData;
  colorClass: string;
  onSelect: (hexCoord: HexCoord) => void;
}) {
  return (
    <button
      className={`${colorClass} ${hexCellData.status === "neutral" ? `cursor-pointer` : ``} flex items-center justify-center transition select-none`}
      style={{ width: HEX_WIDTH, height: HEX_HEIGHT, clipPath: HEX_CLIP }}
      onClick={() => onSelect(hexCellData.coord)}
      aria-label={
        hexCellData.isCapital
          ? `Player ${hexCellData.status} capital`
          : undefined
      }
    >
      {getLabel(hexCellData)}
    </button>
  );
}
