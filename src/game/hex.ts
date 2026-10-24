import { NEIGHBOR_OFFSETS } from "@/game/constants";

import { HexCoord, HexTileData } from "@/types/HexTile";

/**
 * Convertss a coordinate to a string key, to use in `Set` or `Map`.
 *
 * @param coord - The coordinate to convert.
 * @returns The key in `"q,r"` format.
 */
export const coordToKey = (coord: HexCoord): string => `${coord.q},${coord.r}`;

/**
 * Parses a key made by {@link coordToKey}
 *
 * @param key - A key in `"q,r"` format.
 * @return The coordinate.
 */
export const keyToCoord = (key: string): HexCoord => {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
};

/**
 * Converts a coordinate to its position in its column array.
 *
 * `r` is an axial coordinate, so the top tile of each column has a different `r`.
 * The array index counts down from the top tile instead of starting at 0 (0, -1, -1, -2, -2, -3, -3 for columns 0 to 6).
 *
 * The top tile's `r` is `-ceil(q / 2)` so `index = r + ceil(q / 2)`.
 *
 * @param coord - The coordinate.
 * @returns The index into `grid[coord.q]`.
 */
export const coordToIndex = (coord: HexCoord): number =>
  coord.r + Math.ceil(coord.q / 2);

/**
 * Looks up a tile.
 *
 * @param grid - The grid, indexed as `grid[q][index]`.
 * @param coord - The coordinate to look up.
 * @returns The tile, or  `undefined` if the coordinate is off the grid.
 */
export const getTile = (
  grid: HexTileData[][],
  coord: HexCoord,
): HexTileData | undefined => grid[coord.q]?.[coordToIndex(coord)];

/**
 * Replaces one tile with a patched copy.
 *
 * Note: This modifies the grid that's passed in (overwrite a slot in so should only be called on a fresh copy and not on React state).
 *
 * Does nothing if the coordinate is off the grid;
 *
 * @param grid - A copy of the grid to write into.
 * @param coord - The tile to change.
 * @param patch - The fields to overwrite. Fields not listed are not modified.
 */
export const setTile = (
  grid: HexTileData[][],
  hexCoord: HexCoord,
  patch: Partial<HexTileData>,
): void => {
  const tile = getTile(grid, hexCoord);
  if (!tile) return;

  grid[hexCoord.q][coordToIndex(hexCoord)] = { ...tile, ...patch };
};

/**
 * Finds the neighbors of a coordinate on the grid.
 *
 * @param grid - The grid.
 * @param coord - The coordinate whose neighbors to find.
 * @returns Up to six neighbor coordinates in an array.
 */
export const getNeighbors = (
  grid: HexTileData[][],
  coord: HexCoord,
): HexCoord[] =>
  NEIGHBOR_OFFSETS.map((o) => ({
    q: coord.q + o.q,
    r: coord.r + o.r,
  })).filter((c) => getTile(grid, c) !== undefined);

/**
 * Number of steps between two tiles on the hex grid.
 *
 * @param a - First coordinate.
 * @param b - Second coordinate.
 * @returns The distance in tiles (0 for the same tile, 1 for neighbors).
 */
export const hexDistance = (a: HexCoord, b: HexCoord): number => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
};
