import HexCell, { HEX_WIDTH } from "@/components/HexCell";

import { coordToKey } from "@/game/hex";

import {
  CAPTURABLE_CLASS,
  CellStatus,
  HexCellData,
  HexCoord,
  Highlight,
  Player,
  SELECTED_CLASS,
  STATUS_CLASS,
  THREATENED_CLASS,
} from "@/types/HexCell";

const HEX_OVERLAP = HEX_WIDTH / 4;

type BoardProps = {
  board: HexCellData[][];
  selectedKeys: Set<string>;
  capturableKeys: Set<string>;
  currentPlayer: Player;
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

const getColorClass = (
  status: CellStatus,
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

export default function Board({
  board,
  selectedKeys,
  capturableKeys,
  currentPlayer,
  neutralizedKeys,
  onSelect,
}: BoardProps) {
  return (
    <div className="flex flex-row items-center gap-0.5">
      {board.map((column, columnIndex) => (
        <div
          className="flex flex-col gap-0.5"
          key={columnIndex}
          style={{ marginLeft: columnIndex > 0 ? -HEX_OVERLAP : 0 }}
        >
          {column.map((hexCellData) => {
            const key = coordToKey(hexCellData.coord);
            const highlight = getHighlight(key, selectedKeys, capturableKeys);
            return (
              <HexCell
                key={key}
                hexCellData={hexCellData}
                colorClass={getColorClass(
                  hexCellData.status,
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
