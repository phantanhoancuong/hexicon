import HexTile, { HEX_WIDTH } from "@/components/HexTile";

import { coordToKey } from "@/game/hex";

import {
  CAPTURABLE_CLASS,
  HexCoord,
  HexTileData,
  Highlight,
  Player,
  SELECTED_CLASS,
  STATUS_CLASS,
  THREATENED_CLASS,
  TileStatus,
} from "@/types/HexTile";

/** Horizontal overlap between neighboring columns, so flat-top hexes interlock. */
const HEX_OVERLAP = HEX_WIDTH / 4;

type HexGridProps = {
  grid: HexTileData[][];
  selectedKeys: Set<string>;
  /** Subset of `selectedKeys` that would be captured on submit. */
  capturableKeys: Set<string>;
  currentPlayer: Player;
  /** Keys of the enemy tiles that would turn `neutral` on submit. */
  neutralizedKeys: Set<string>;
  onSelect: (coord: HexCoord) => void;
};

const getHighlight = (
  key: string,
  selectedKeys: Set<string>,
  capturableKeys: Set<string>,
): Highlight => {
  if (!selectedKeys.has(key)) return "none";
  return capturableKeys.has(key) ? "capturable" : "selected";
};

/** Picks the color classes for a tile, by highlight first and then by owner. */
const getColorClass = (
  status: TileStatus,
  highlight: Highlight,
  player: Player,
  isNeutralized: boolean,
): string => {
  if (highlight === "capturable") return CAPTURABLE_CLASS[player];
  if (highlight === "selected") return SELECTED_CLASS;
  if (isNeutralized && typeof status === "number")
    return THREATENED_CLASS[status];
  return STATUS_CLASS[status];
};

export default function HexGrid({
  grid,
  selectedKeys,
  capturableKeys,
  currentPlayer,
  neutralizedKeys,
  onSelect,
}: HexGridProps) {
  return (
    <div className="flex flex-row items-center gap-0.5">
      {grid.map((column, columnIndex) => (
        <div
          className="flex flex-col gap-0.5"
          key={columnIndex}
          style={{ marginLeft: columnIndex > 0 ? -HEX_OVERLAP : 0 }}
        >
          {column.map((tile) => {
            const key = coordToKey(tile.coord);
            const highlight = getHighlight(key, selectedKeys, capturableKeys);
            return (
              <HexTile
                key={key}
                tile={tile}
                colorClass={getColorClass(
                  tile.status,
                  highlight,
                  currentPlayer,
                  neutralizedKeys.has(key),
                )}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
