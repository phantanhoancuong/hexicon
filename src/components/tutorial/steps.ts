import { CAPITAL_COORDS } from "@/game/constants";
import { getCapturableKeys, initHexGrid, resolveSubmit } from "@/game/grid";
import { coordToKey, getNeighbors, getTile, setTile } from "@/game/hex";

import { HexCoord, HexTileData, Player } from "@/types/HexTile";

export const TUTORIAL_PLAYER: Player = 1;

/** A page to explain the board. */
export type Info = {
  text: string;
  focus?: (grid: HexTileData[][]) => HexCoord[];
  prepare?: (grid: HexTileData[][]) => HexTileData[][];
};

/** A tile for the player to select. */
export type Tap = {
  at: HexCoord;
  text: string;
};

/** A page to explain where to spell a word and submit the word. */
export type Step = {
  taps: Tap[];
  explain: Info[];
  ready: string;
  success: string;
  prepare: (grid: HexTileData[][]) => HexTileData[][];
};

/** A step in the tutorial. */
export type Page = Info | Step;

/** If a page is a move to play. */
export const isStep = (page: Page): page is Step => "taps" in page;

/** Copies the columns. This is so the tiles can be replaced without modifying the original data. */
const copyGrid = (grid: HexTileData[][]): HexTileData[][] =>
  grid.map((column) => [...column]);

/** Deals letters to the tiles around a player's capital, in neighbor order.*/
const dealAround = (
  grid: HexTileData[][],
  player: Player,
  letters: string,
): void =>
  getNeighbors(grid, CAPITAL_COORDS[player]).forEach((coord, i) =>
    setTile(grid, coord, { status: "neutral", character: letters[i] }),
  );

/** The land each player starts with next to their capital. */
const START_LAND: [q: number, r: number, player: Player][] = [
  [0, 0, 1],
  [0, 1, 1],
  [6, 1, 2],
  [6, 2, 2],
];

/**
 * Builds the starting board.
 *
 * The board has two capitals, each player has a little bit of land around their capital.
 */
export const createScenario = (): HexTileData[][] => {
  const grid = initHexGrid().map((column) =>
    column.map((tile): HexTileData => ({
      ...tile,
      status: "uninitialized",
      character: "",
      isCapital: false,
    })),
  );
  for (const player of [1, 2] as const) {
    setTile(grid, CAPITAL_COORDS[player], { status: player, isCapital: true });
  }
  dealAround(grid, 1, "TASSNR");
  dealAround(grid, 2, "OLDIMU");
  for (const [q, r, player] of START_LAND) {
    setTile(grid, { q, r }, { status: player, character: "" });
  }
  return grid;
};

/** Spells the word that the tiles make, in order. */
export const pathWord = (grid: HexTileData[][], path: HexCoord[]): string =>
  path.map((coord) => getTile(grid, coord)?.character ?? "").join("");

type Patch = [q: number, r: number, patch: Partial<HexTileData>];

/** Copies the grid with the given tiles changed. */
const patched = (grid: HexTileData[][], patches: Patch[]): HexTileData[][] => {
  const next = copyGrid(grid);
  for (const [q, r, patch] of patches) setTile(next, { q, r }, patch);
  return next;
};

/** The coordinates of the tiles that match some criteria. */
const tilesWhere = (
  grid: HexTileData[][],
  matches: (tile: HexTileData) => boolean,
): HexCoord[] =>
  grid
    .flat()
    .filter(matches)
    .map((tile) => tile.coord);

/** The pages in a tutorial, in order. */
export const PAGES: Page[] = [
  {
    text: "Let's learn how to play hexicon!",
    focus: () => [],
  },
  {
    text: "These tiles are your land",
    focus: (grid) => tilesWhere(grid, (tile) => tile.status === 1),
  },
  {
    text: "This specific tile with the crown is your capital",
    focus: (grid) =>
      tilesWhere(grid, (tile) => tile.status === 1 && tile.isCapital),
  },
  {
    text: "These tiles are your opponent's land",
    focus: (grid) => tilesWhere(grid, (tile) => tile.status === 2),
  },
  {
    text: "This is your opponent's capital",
    focus: (grid) =>
      tilesWhere(grid, (tile) => tile.status === 2 && tile.isCapital),
  },
  {
    text: "The goal is to capture all your opponent's land",
    focus: () => [],
  },
  {
    text: "We do that by spelling words from these neutral tiles",
    focus: (grid) => tilesWhere(grid, (tile) => tile.status === "neutral"),
  },
  {
    taps: [
      { at: { q: 1, r: 1 }, text: "Let's spell R-A-T. Tap R" },
      { at: { q: 2, r: -1 }, text: "Tap A" },
      { at: { q: 2, r: 0 }, text: "Tap T" },
    ],
    explain: [
      {
        text: "The letters touch your land so they will be CAPTURED and added to your territory",
        focus: () => [
          { q: 1, r: 1 },
          { q: 2, r: -1 },
          { q: 2, r: 0 },
        ],
      },
    ],
    ready: "Press SUBMIT",
    success: "Captured!",
    prepare: (grid) => grid,
  },
  {
    taps: [
      { at: { q: 3, r: 0 }, text: "Try spelling T-E-N next. Tap T" },
      { at: { q: 3, r: 1 }, text: "Tap E" },
      { at: { q: 3, r: 2 }, text: "Tap N" },
    ],
    explain: [
      {
        text: "Even though only T touches your land",
        focus: () => [{ q: 3, r: 0 }],
      },
      {
        text: "E and N link back to T so they will also be CAPTURED",
        focus: () => [
          { q: 3, r: 1 },
          { q: 3, r: 2 },
        ],
      },
    ],
    ready: "Press SUBMIT",
    success: "Captured!",
    prepare: (grid) =>
      patched(grid, [
        [3, 0, { status: "neutral", character: "T" }],
        [3, 1, { status: "neutral", character: "E" }],
        [3, 2, { status: "neutral", character: "N" }],
      ]),
  },
  {
    taps: [
      { at: { q: 1, r: -1 }, text: "Try to spell S-E-N-D next" },
      { at: { q: 1, r: 2 }, text: "Tap E" },
      { at: { q: 0, r: 2 }, text: "Tap N" },
      { at: { q: 0, r: 4 }, text: "Tap D" },
    ],
    explain: [
      {
        text: "S, E, and N get CAPTURED because they touch your land",
        focus: () => [
          { q: 1, r: -1 },
          { q: 1, r: 2 },
          { q: 0, r: 2 },
        ],
      },
      {
        text: "D doesn't touch nor link back to your land, so it's NOT captured",
        focus: () => [{ q: 0, r: 4 }],
      },
    ],
    ready: "Press SUBMIT",
    success: "D also changed into a different letter",
    prepare: (grid) =>
      patched(grid, [
        [1, 2, { status: "neutral", character: "E" }],
        [0, 2, { status: "neutral", character: "N" }],
        [0, 4, { status: "neutral", character: "D" }],
      ]),
  },
  {
    taps: [
      { at: { q: 3, r: 3 }, text: "Spell O-N" },
      { at: { q: 2, r: 4 }, text: "Tap N" },
    ],
    explain: [
      {
        text: "Enemy tiles next to captured tiles turn neutral",
        focus: () => [
          { q: 3, r: 4 },
          { q: 4, r: 3 },
        ],
      },
    ],
    ready: "Press SUBMIT",
    success:
      "Enemy tiles next to captured tiles get destroyed and turned to neutral",
    prepare: (grid) =>
      patched(grid, [
        [3, 3, { status: "neutral", character: "O" }],
        [2, 4, { status: "neutral", character: "N" }],
        [3, 4, { status: 2, character: "" }],
        [4, 3, { status: 2, character: "" }],
      ]),
  },
  {
    taps: [
      { at: { q: 5, r: 1 }, text: "Spell E-A-S-T next. Tap E" },
      { at: { q: 5, r: 0 }, text: "Tap A" },
      { at: { q: 4, r: 0 }, text: "Tap S" },
      { at: { q: 4, r: 1 }, text: "Tap T" },
    ],
    explain: [
      {
        text: "Capturing next to a capital destroys it",
        focus: () => [CAPITAL_COORDS[2]],
      },
    ],
    ready: "Press SUBMIT",
    success: "Capital destroyed!",
    prepare: (grid) =>
      patched(grid, [
        [4, 2, { status: 1, character: "" }],
        [4, 3, { status: 1, character: "" }],
        [5, 3, { status: 2, character: "" }],
        [5, 1, { status: "neutral", character: "E" }],
        [5, 0, { status: "neutral", character: "A" }],
        [4, 0, { status: "neutral", character: "S" }],
        [4, 1, { status: "neutral", character: "T" }],
      ]),
  },
  {
    text: "Destroying a capital gives you an extra turn",
  },
  {
    taps: [
      { at: { q: 6, r: 1 }, text: "Finish it. Spell G-O. Tap G" },
      { at: { q: 5, r: 2 }, text: "Tap O" },
    ],
    explain: [
      {
        text: "Capturing next to the last enemy tiles wins you the game",
        focus: () => [
          { q: 6, r: 2 },
          { q: 5, r: 3 },
        ],
      },
    ],
    ready: "Press SUBMIT",
    success: "The opponent has no land left!",
    prepare: (grid) => grid,
  },
];

/** Letters to deal to tiles during a move. This is to make the tutorial deterministic. */
const FILLER = "EARIOTNSLCUDPMHGBFYWKVXZJQ";

/** Tiles that are set by hand, so the player can spell a later word. */
const FIXED: Record<string, string> = { "6,1": "G", "5,2": "O" };

/** The letter a tile gets when it is dealt during a move. */
const fillerAt = (coord: HexCoord): string => {
  const { q, r } = coord;
  return (
    FIXED[coordToKey(coord)] ??
    FILLER[(((q * 7 + r * 3) % FILLER.length) + FILLER.length) % FILLER.length]
  );
};

/** Replaces the random letters dealt by a move with fixed ones. */
const settle = (
  before: HexTileData[][],
  after: HexTileData[][],
): HexTileData[][] =>
  after.map((column) =>
    column.map((tile) => {
      const previous = getTile(before, tile.coord);
      const dealt =
        tile.status === "neutral" &&
        (previous?.status !== "neutral" ||
          previous.character !== tile.character);
      return dealt ? { ...tile, character: fillerAt(tile.coord) } : tile;
    }),
  );

/** Plays the taps of a move as the submitted word and returns the new grid. */
export const playStep = (
  grid: HexTileData[][],
  step: Step,
): HexTileData[][] => {
  const keys = new Set(step.taps.map((tap) => coordToKey(tap.at)));
  const capturableKeys = getCapturableKeys(grid, keys, TUTORIAL_PLAYER);
  const result = resolveSubmit(grid, keys, capturableKeys, TUTORIAL_PLAYER);
  return settle(grid, result.grid);
};

/** Applies the changes a page makes to the grid before it is shown. */
const enter = (grid: HexTileData[][], page: Page): HexTileData[][] =>
  page.prepare ? page.prepare(grid) : grid;

/** Rebuilds the board by playing the first `count` pages from the start. */
const replay = (count: number): HexTileData[][] => {
  let grid = createScenario();
  for (let i = 0; i < count; i++) {
    const page = PAGES[i];
    grid = enter(grid, page);
    if (isStep(page)) grid = playStep(grid, page);
  }
  return grid;
};

/** The board when a page is shown. */
export const gridForPage = (index: number): HexTileData[][] => {
  const at = Math.max(index, 0);
  const grid = replay(Math.min(at, PAGES.length));
  return PAGES[at] ? enter(grid, PAGES[at]) : grid;
};

/** The board after the move on a page is played. */
export const gridAfterPage = (index: number): HexTileData[][] =>
  replay(index + 1);
