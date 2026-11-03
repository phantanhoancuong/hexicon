/**
 * Bot's logical scheme.
 *
 * The bot is built to mimic a human player through heuristics. Each turn runs through the following six stages:
 *
 * 1. LOOK
 * The bot collects its tiles, the enemy tiles, the enemy capital, and the rings of tiles around its own capital to get relevant information on the game state.
 *
 * 2. NOTICE
 * The bot spots some of the neutral tiles with a bias towards the ones near its territory and put into a pool.
 *
 * 3. FIND
 * The bot finds every word that can be spelt with the letters from the pool.
 * If no words can be found it's a PASS.
 *
 * 4. RECALL
 * The bot keeps some of the words with a bias towards more common words.
 * If no words get recalled then the bot guess a few short, uncommon words.
 * If it keeps nothing by that time, it's a PASS.
 *
 * 5. PLACE
 * For each word the bot keeps, the bot grows several islands towards the enemy capital (`growIsland`).
 * The bot then scores each of them (`scoreMove`) and keeps the best one.
 *
 * 6. CHOOSE
 * The bot picks one of the placed words.
 * Higher scores are likelier to be chosen, and the level's temperature determines how careful the bot plays (less random or more random).
 *
 * The settings for each level are in `botProfiles.ts`
 */
import { BotProfile, PROFILES } from "@/game/botProfiles";
import { Dictionary } from "@/game/dictionary";
import {
  getCapturableKeys,
  getNeutralizedKeys,
  isSelectable,
  nextPlayer,
} from "@/game/game";
import {
  coordToKey,
  getNeighbors,
  getTile,
  hexDistance,
  keyToCoord,
} from "@/game/hex";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

/** NOTICE: How fast the chance of spotting a tile drops with its distance from the bot's territory. */
const DISTANCE_TAU = 1.5;

/** RECALL: The lowest chance of recalling a common word, so sometimes less common common words can still be played. */
const MIN_RECALL = 0.02;

/** RECALL: The length of the shortest uncommon word the bot tries. */
const SHORTEST_GUESS = 2;

/** RECALL: The chance of  guessing an uncommon words of `SHORTEST_GUESS` letters. */
const SHORTEST_GUESS_CHANCE = 0.02;

/** RECALL: Each letter past `SHORTEST_GUESS` multiplies the chance by this, so longer guesses are less common. */
const GUESS_DECAY = 0.5;

/** PLACE: How many tiles are worth one point. */
const TILES_PER_POINT = 10;

/** PLACE: How many tiles of damage destroying the enemy counts as. */
const CAPITAL_DAMAGE = 20;

/** PLACE: How many steps closer to the enemy capital give a full progress bonus. */
const FULL_APPROACH = 4;

/** What the bot knows about the board before it moves. */
type Situation = {
  grid: HexTileData[][];
  player: Player;
  /** Coordinates of the bot's tiles. */
  mine: HexCoord[];
  /** Coordinates of the opponent's tiles. */
  enemies: HexCoord[];
  /** Where the opponent's capital is, or `null` if the opponent's capital is not placed. */
  enemyCapital: HexCoord | null;
  /** The tiles around the bot's capital, one array per ring, nearest ring first. */
  rings: HexTileData[][];
  /** Length of the bot's border before it moves. */
  border: number;
  /** Steps from the bot's territory to the enemy capital before it moves. */
  capitalDistance: number;
};

/** Keeps a number between `min` and `max`. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Picks an item at random, with likelier items given larger weights.
 *
 * @param items - The items to choose from. Must NOT be empty.
 * @param weights - One non-negative weight per item.
 * @param random - Returns a number in [0, 1).
 * @returns The chosen item.
 */
const weightedPick = <T>(
  items: T[],
  weights: number[],
  random: () => number,
): T => {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;

  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }

  return items[items.length - 1];
};

/** Smallest distance from `from` to any of the targets (`Infinity` if none). */
const nearest = (from: HexCoord, targets: HexCoord[]): number =>
  targets.reduce(
    (min, target) => Math.min(min, hexDistance(from, target)),
    Infinity,
  );

/** The letters of some tiles joined into one string. */
const lettersOf = (tiles: HexTileData[]): string =>
  tiles.map((tile) => tile.character).join("");

/**
 * Counts the tile edges between a territory and everything that is not in the territory.
 *
 * @param grid - Current hex grid state.
 * @param territory - Coordinates of the tiles in the territory.
 * @param isMine - If a coordinate belongs to the territory.
 * @returns The length of the border. The edge of the board does not count.
 */
const borderLength = (
  grid: HexTileData[][],
  territory: HexCoord[],
  isMine: (coord: HexCoord) => boolean,
): number =>
  territory.reduce(
    (total, coord) =>
      total + getNeighbors(grid, coord).filter((n) => !isMine(n)).length,
    0,
  );

/**
 * Collects relevant information for the bot before it moves.
 *
 * @param grid - Current hex grid state.
 * @param player - The player the bot is playing.
 * @param layers - How many rings around its capital to look at.
 * @returns The bot's view of the board.
 */
const readSituation = (
  grid: HexTileData[][],
  player: Player,
  layers: number,
): Situation => {
  const opponent = nextPlayer(player);
  const tiles = grid.flat();
  const mine = tiles
    .filter((tile) => tile.status === player)
    .map((tile) => tile.coord);
  const enemies = tiles
    .filter((tile) => tile.status === opponent)
    .map((tile) => tile.coord);
  const ownCapital = tiles.find(
    (tile) => tile.isCapital && tile.status === player,
  );
  const enemyCapital =
    tiles.find((tile) => tile.isCapital && tile.status === opponent)?.coord ??
    null;

  const rings = ownCapital
    ? Array.from({ length: layers }, (_, i) =>
        tiles.filter(
          (tile) => hexDistance(ownCapital.coord, tile.coord) === i + 1,
        ),
      ).filter((ring) => ring.length > 0)
    : [];

  return {
    grid,
    player,
    mine,
    enemies,
    enemyCapital,
    rings,
    border: borderLength(
      grid,
      mine,
      (coord) => getTile(grid, coord)?.status === player,
    ),
    capitalDistance: enemyCapital ? nearest(enemyCapital, mine) : Infinity,
  };
};

/**
 * Picks the tiles that the bot pays attention to this turn.
 *
 * A tile next to the bot's territory is noticed with the level's attention chance. Farther tiles are noticed less often.
 *
 * @param selectable - Every neutral tile on the grid.
 * @param owned - Coordinates of the bot's own tiles.
 * @param attention - The chance of spotting a tile next to the bot's territory.
 * @param random - Returns a number in [0, 1).
 * @returns The tiles in the pool.
 */
const attentionPool = (
  selectable: HexTileData[],
  owned: HexCoord[],
  attention: number,
  random: () => number,
): HexTileData[] =>
  selectable.filter(
    (tile) =>
      random() <
      attention * Math.exp(-(nearest(tile.coord, owned) - 1) / DISTANCE_TAU),
  );

/**
 * The chance the bot knows a common word with a bias towards more common words.
 *
 * @param word - A word from the common list.
 * @param dictionary - Provides how common the word is.
 * @param profile - Sets how fast less common words are forgotten.
 * @returns A chance from 0 to 1.
 */
const recallChance = (
  word: string,
  dictionary: Dictionary,
  profile: BotProfile,
): number =>
  Math.max(MIN_RECALL, dictionary.commonness(word) ** profile.recallPower);

/**
 * The chance the bot tries a word it does not know with a bias towards shorter ones.
 *
 * This is to mimic a player typing valid looking words without actually knowing what they mean.
 *
 * @param word - A word from outside the common list.
 * @param profile - Sets the longest word the bot will try.
 * @returns A chance from 0 to 1.
 */
const guessChance = (word: string, profile: BotProfile): number =>
  word.length > profile.maxGuessLength
    ? 0
    : SHORTEST_GUESS_CHANCE *
      GUESS_DECAY ** Math.max(0, word.length - SHORTEST_GUESS);

/**
 * Takes a random sample of words.
 *
 * @param words - The words to sample from.
 * @param count - The most words to take.
 * @param random - Returns a number in [0, 1).
 * @returns Up to `count` different words.
 */
const sampleWords = (
  words: string[],
  count: number,
  random: () => number,
): string[] => {
  const pool = [...words];
  const size = Math.min(count, pool.length);

  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
};

/**
 * Picks the words the bot thinks of in a turn.
 *
 * The bot first tries words it knows. Common words are kept or dropped at random, with a bias towards keeping more common ones.
 *
 * If no common words are kept, the bot tries to guess short uncommon words.
 *
 * @param words - The words that fit the tiles the bot spotted.
 * @param dictionary - Provides whether and how common each word is.
 * @param profile - Sets how many words to keep, which words the bot knows and how long a guess can be.
 * @param random - Returns a number in [0, 1).
 * @returns Up to `profile.candidateWords` words, or none if nothing came to mind.
 */
const recallWords = (
  words: string[],
  dictionary: Dictionary,
  profile: BotProfile,
  random: () => number,
): string[] => {
  const common = words.filter((word) => dictionary.isCommon(word));
  const known = common.filter(
    (word) => random() < recallChance(word, dictionary, profile),
  );
  if (known.length > 0) {
    return sampleWords(known, profile.candidateWords, random);
  }

  const guesses = words.filter(
    (word) =>
      !dictionary.isCommon(word) && random() < guessChance(word, profile),
  );
  return sampleWords(guesses, profile.candidateWords, random);
};

/**
 * Spells a word by growing a captured island outward from the bot's territory one tile at a time.
 *
 * Each step the bot considered the tiles that touch its territory or the island so far and hold a missing letter in the word. Tiles that touch more of the territory and island, or are closer to the goal are likelier to be chosen.
 *
 * When no such tile is left, the letters still missing go on any other tile with that letter. These tiles are not connected, so they don't get captured so they're considered last.
 *
 * @param word - The word to spell. Its letters must be available among `pool`.
 * @param pool - The tiles the word can use.
 * @param neighbors - The keys of each pool tile's neighbors, by tile key.
 * @param owned - Coordinates of the bot's own tiles.
 * @param goal - Where the island grows towards, or `null` for no preference.
 * @param pull - How strongly the goal draws the island.
 * @param random - Returns a number in [0, 1).
 * @returns The keys of the chosen tiles, in word order.
 */
const growIsland = (
  word: string,
  pool: HexTileData[],
  neighbors: Map<string, string[]>,
  owned: HexCoord[],
  goal: HexCoord | null,
  pull: number,
  random: () => number,
): string[] => {
  const reach = new Set(owned.map(coordToKey));
  const needed = new Map<string, number>();
  for (const letter of word) needed.set(letter, (needed.get(letter) ?? 0) + 1);

  const left = [...pool];
  const placed = new Map<string, string[]>();

  const place = (tile: HexTileData): void => {
    left.splice(left.indexOf(tile), 1);
    needed.set(tile.character, needed.get(tile.character)! - 1);
    placed.set(tile.character, [
      ...(placed.get(tile.character) ?? []),
      coordToKey(tile.coord),
    ]);
  };
  const touching = (tile: HexTileData): number =>
    (neighbors.get(coordToKey(tile.coord)) ?? []).filter((key) =>
      reach.has(key),
    ).length;
  const frontier = (): HexTileData[] =>
    left.filter(
      (tile) => (needed.get(tile.character) ?? 0) > 0 && touching(tile) > 0,
    );

  for (let open = frontier(); open.length > 0; open = frontier()) {
    const weights = open.map(
      (tile) =>
        touching(tile) *
        Math.exp(-pull * (goal ? hexDistance(tile.coord, goal) : 0)),
    );
    const tile = weightedPick(open, weights, random);
    place(tile);
    reach.add(coordToKey(tile.coord));
  }

  for (const [letter, count] of [...needed]) {
    for (let i = 0; i < count; i++) {
      const options = left.filter((tile) => tile.character === letter);
      place(options[Math.floor(random() * options.length)]);
    }
  }

  return [...word].map((letter) => placed.get(letter)!.shift()!);
};

/**
 * Adds up the damage a capture does to the enemy.
 *
 * @param grid - Current hex grid state.
 * @param neutralized - Keys of the tiles the capture turns neutral.
 * @returns The damage in tiles, and the keys of enemy tiles lost.
 */
const enemyDamage = (
  grid: HexTileData[][],
  neutralized: Set<string>,
): { damage: number; lost: Set<string> } => {
  const lost = new Set<string>();
  let damage = 0;

  for (const key of neutralized) {
    const tile = getTile(grid, keyToCoord(key))!;
    if (typeof tile.status !== "number") continue;

    lost.add(key);
    damage += tile.isCapital ? CAPITAL_DAMAGE : 1;
  }
  return { damage, lost };
};

/**
 * Measures how open the area around the bot's capital is.
 *
 * Counts each ring's tiles that are not the bot's and have any enemy tile in reach. Inner rings cound more.
 *
 * @param situation - The board before the move.
 * @param isMineAfter - If a coordinate belongs to the bot after the move.
 * @param enemiesAfter - Coordinates of the enemy tiles left after the move.
 * @param reach - How near an enemy tile must be to count as a threat.
 * @returns A number from 0 (closed) to 1(open and threatened everywhere).
 */
const openBase = (
  situation: Situation,
  isMineAfter: (coord: HexCoord) => boolean,
  enemiesAfter: HexCoord[],
  reach: number,
): number => {
  let open = 0;
  let total = 0;

  situation.rings.forEach((ring, i) => {
    const weight = 1 / (i + 1);
    const holes = ring.filter(
      (tile) =>
        !isMineAfter(tile.coord) && nearest(tile.coord, enemiesAfter) <= reach,
    ).length;

    open += (weight * holes) / ring.length;
    total += weight;
  });
  return total > 0 ? open / total : 0;
};

/**
 * Scores a move.
 *
 * Adds the tiles captured, the damage to the enemy, the word's commoness, and progress towards the enemy capitals.
 *
 * Penalizes longer border and for open tiles around the bot's capital.
 *
 * @param situation - The boarrd before the move.
 * @param keys - Keys of the tiles the move would select.
 * @param word - The word the move spells.
 * @param profile - The weights of the bot's level.
 * @param dictionary - Provides how common a word is.
 * @returns The score. A higher score means a better move.
 */
const scoreMove = (
  situation: Situation,
  keys: string[],
  word: string,
  profile: BotProfile,
  dictionary: Dictionary,
): number => {
  const { grid, player } = situation;
  const capturable = getCapturableKeys(grid, new Set(keys), player);
  const neutralized = getNeutralizedKeys(grid, capturable, player);
  const { damage, lost } = enemyDamage(grid, neutralized);

  const captured = [...capturable].map(keyToCoord);
  const isMineAfter = (coord: HexCoord): boolean =>
    capturable.has(coordToKey(coord)) ||
    getTile(grid, coord)?.status === player;
  const enemiesAfter = situation.enemies.filter(
    (coord) => !lost.has(coordToKey(coord)),
  );

  const borderGrowth = clamp(
    (borderLength(grid, [...situation.mine, ...captured], isMineAfter) -
      situation.border) /
      TILES_PER_POINT,
    -1,
    1,
  );
  const approach =
    situation.enemyCapital && captured.length > 0
      ? clamp(
          (situation.capitalDistance -
            nearest(situation.enemyCapital, captured)) /
            FULL_APPROACH,
          0,
          1,
        )
      : 0;
  const holes = openBase(
    situation,
    isMineAfter,
    enemiesAfter,
    profile.threatReach,
  );

  return (
    capturable.size / TILES_PER_POINT +
    (profile.damage * damage) / TILES_PER_POINT +
    profile.familiarity * dictionary.commonness(word) +
    profile.approach * approach -
    profile.perimeter * borderGrowth -
    profile.holes * holes
  );
};

/**
 * Places a word several times then keeps highest scoring placement.
 *
 * @param situation - The board before the move.
 * @param word - The word to place.
 * @param pool - T he tiles the word can use.
 * @param neighbors - The key of each pool tile's neighbors, by tile key.
 * @param profile - Sets how many plaacements to try and how strongly to goal pulls.
 * @param dictionary - Provides how common the word iis.
 * @param random - Returns a number in [0, 1).
 * @returns The keys of the best placement, in word order, and its score.
 */
const bestPlacement = (
  situation: Situation,
  word: string,
  pool: HexTileData[],
  neighbors: Map<string, string[]>,
  profile: BotProfile,
  dictionary: Dictionary,
  random: () => number,
): { keys: string[]; appeal: number } => {
  let best = { keys: [] as string[], appeal: -Infinity };

  for (let i = 0; i < profile.placements; i++) {
    const keys = growIsland(
      word,
      pool,
      neighbors,
      situation.mine,
      situation.enemyCapital,
      profile.goalPull,
      random,
    );
    const appeal = scoreMove(situation, keys, word, profile, dictionary);
    if (appeal > best.appeal) best = { keys, appeal };
  }
  return best;
};

/**
 * Chooses a move for the bot.
 *
 * See `"Bot's logical scheme"` at the top of the file.
 *
 * @param grid - Current hex grid state.
 * @param player - The player the bot is playing.
 * @param dictionary - The dictionary to find words in.
 * @param profile - The bot level's weights. Defaults to medium.
 * @param random - Returns a number in [0, 1).
 * @returns The keys of the tiles to select, in word order, or `null` if the bot passes.
 */
export const chooseMove = (
  grid: HexTileData[][],
  player: Player,
  dictionary: Dictionary,
  profile: BotProfile = PROFILES.medium,
  random: () => number = Math.random,
): string[] | null => {
  const situation = readSituation(grid, player, profile.baseLayers);
  const selectable = grid.flat().filter(isSelectable);

  const pool = attentionPool(
    selectable,
    situation.mine,
    profile.attention,
    random,
  );
  const words = dictionary.findWords(lettersOf(pool));
  if (words.length === 0) return null;

  const neighbors = new Map(
    pool.map((tile): [string, string[]] => [
      coordToKey(tile.coord),
      getNeighbors(grid, tile.coord).map(coordToKey),
    ]),
  );
  const candidates = recallWords(words, dictionary, profile, random).map(
    (word) =>
      bestPlacement(
        situation,
        word,
        pool,
        neighbors,
        profile,
        dictionary,
        random,
      ),
  );
  if (candidates.length === 0) return null;

  const best = Math.max(...candidates.map((c) => c.appeal));
  const weights = candidates.map((c) =>
    Math.exp((c.appeal - best) / profile.temperature),
  );
  return weightedPick(candidates, weights, random).keys;
};
