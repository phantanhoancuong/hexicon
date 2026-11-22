import {
  getCapturableKeys,
  getNeutralizedKeys,
  resolveSubmit,
} from "@/game/grid";
import { coordToKey } from "@/game/hex";

import { HexTileData, Player } from "@/types/HexTile";

export const PREVIEW_PLAYER: Player = 1;

const FILLER = "EASONR";

const START_MS = 1200;

const TAP_MS = 600;

const SUBMIT_MS = 1400;

const END_MS = 1800;

export type Preview = {
  columns: string[];
  taps: string[];
};

/** One moment of a preview. */
export type PreviewFrame = {
  grid: HexTileData[][];
  selectedKeys: Set<string>;
  capturableKeys: Set<string>;
  neutralizedKeys: Set<string>;
  word: string;
  holdMs: number;
};

const buildGrid = (columns: string[]): HexTileData[][] =>
  columns.map((column, q) =>
    column.split(" ").map((cell, index): HexTileData => {
      const coord = { q, r: index - Math.ceil(q / 2) };
      if (cell === ".") {
        return {
          coord,
          character: "",
          status: "uninitialized",
          isCapital: false,
        };
      }
      if (cell === "1" || cell === "2") {
        return {
          coord,
          character: "",
          status: Number(cell) as Player,
          isCapital: false,
        };
      }
      if (cell === "C1" || cell === "C2") {
        return {
          coord,
          character: "",
          status: Number(cell[1]) as Player,
          isCapital: true,
        };
      }
      return { coord, character: cell, status: "neutral", isCapital: false };
    }),
  );

const settle = (
  before: HexTileData[][],
  after: HexTileData[][],
  selectedKeys: Set<string>,
): HexTileData[][] =>
  after.map((column, q) =>
    column.map((tile, index) => {
      const old = before[q][index];
      const dealt =
        tile.status === "neutral" &&
        (old.status !== "neutral" || selectedKeys.has(coordToKey(tile.coord)));
      if (!dealt) return tile;

      const pick = (tile.coord.q * 3 + tile.coord.r * 5) % FILLER.length;
      return {
        ...tile,
        character: FILLER[(pick + FILLER.length) % FILLER.length],
      };
    }),
  );

export const previewFrames = (preview: Preview): PreviewFrame[] => {
  const grid = buildGrid(preview.columns);
  const path = preview.taps.map((tap) => {
    const [column, index] = tap.split(".").map(Number);
    return grid[column][index];
  });

  const frames: PreviewFrame[] = [
    {
      grid,
      selectedKeys: new Set(),
      capturableKeys: new Set(),
      neutralizedKeys: new Set(),
      word: "",
      holdMs: START_MS,
    },
  ];

  path.forEach((_, count) => {
    const tapped = path.slice(0, count + 1);
    const selectedKeys = new Set(tapped.map((tile) => coordToKey(tile.coord)));
    const capturableKeys = getCapturableKeys(
      grid,
      selectedKeys,
      PREVIEW_PLAYER,
    );

    frames.push({
      grid,
      selectedKeys,
      capturableKeys,
      neutralizedKeys: getNeutralizedKeys(grid, capturableKeys, PREVIEW_PLAYER),
      word: tapped.map((tile) => tile.character).join(""),
      holdMs: count === path.length - 1 ? SUBMIT_MS : TAP_MS,
    });
  });

  const last = frames[frames.length - 1];
  const result = resolveSubmit(
    grid,
    last.selectedKeys,
    last.capturableKeys,
    PREVIEW_PLAYER,
  );

  frames.push({
    grid: settle(grid, result.grid, last.selectedKeys),
    selectedKeys: new Set(),
    capturableKeys: new Set(),
    neutralizedKeys: new Set(),
    word: last.word,
    holdMs: END_MS,
  });

  return frames;
};
