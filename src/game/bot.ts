import { Dictionary } from "@/game/dictionary";
import {
  getCapturableKeys,
  getNeutralizedKeys,
  isSelectable,
} from "@/game/game";
import { coordToKey, getTile, hexDistance, keyToCoord } from "@/game/hex";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

/** How many known words the bot builds a placement for. */
const CANDIDATE_WORDS = 60;

/** Higher values make the bot pick weaker moves more often. */
const TEMPERATURE = 1.5;

/** How quickly a tile's pull falls off with distance from the bot's territory. */
const DISTANCE_TAU = 1.5;

/** Score for neutralizing an enemy tile, compared to 1 for capturing one. */
const ENEMY_TILE_SCORE = 0.5;

/** Score for destroying a capital. High incentive because it gets another turn. */
const CAPITAL_SCORE = 10;

/** The lowest chance the bot knows a word, so even rare words are sometimes picked. */
const MIN_RECALL = 0.02;

/** Points added to a move's score for a word's commonness. */
const FAMILIARITY_BONUS = 3;

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
 * Picks the tiles that the bot pays attention to this turn.
 *
 * A tile next to the bot's territory is always included. Farther tiles are included less often.
 *
 * @param selectable - Every neutral tile on the grid.
 * @param owned - Coordinates of the bot's own tiles.
 * @param random - Returns a number in [0, 1).
 * @returns The tiles in the pool.
 */
const attentionPool = (
  selectable: HexTileData[],
  owned: HexCoord[],
  random: () => number,
): HexTileData[] =>
  selectable.filter(
    (tile) =>
      random() < Math.exp(-(nearest(tile.coord, owned) - 1) / DISTANCE_TAU),
  );

/** The chance the bot thinks of a word: near 1 for everyday words, low for rare ones. */
const recallChance = (word: string, dictionary: Dictionary): number =>
  Math.max(MIN_RECALL, dictionary.commonness(word));

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
 * Each word is kept or dropped at random with a bias for keeping more common words.
 *
 * @param words - The words that fit the tiles.
 * @param dictionary - Provides the word's rank and how likely each word is to be kept.
 * @param count - The most words to keep.
 * @param random - Returns a number in [0, 1).
 * @returns Up to `count` words, or a sample of all the words if everything was dropped.
 */
const recallWords = (
  words: string[],
  dictionary: Dictionary,
  count: number,
  random: () => number,
): string[] => {
  const known = words.filter(
    (word) => random() < recallChance(word, dictionary),
  );
  return sampleWords(known.length > 0 ? known : words, count, random);
};

/**
 * Spells a word on the pool tiles, with a bias towards tiles close to the bot's territory and to the tiles already selected.
 *
 * @param word - The word to spell. Its letters must be available among `pool`.
 * @param pool - The tiles the word can use.
 * @param owned - Coordinates of the bot's owned tiles.
 * @param random - Returns a number in [0, 1).
 * @returns The keys of the chosen tiles, in word order.
 */
const placeWord = (
  word: string,
  pool: HexTileData[],
  owned: HexCoord[],
  random: () => number,
): string[] => {
  const available = [...pool];
  const chosen: HexTileData[] = [];

  for (const letter of word) {
    const options = available.filter((tile) => tile.character === letter);
    const reach = [...owned, ...chosen.map((tile) => tile.coord)];
    const weights = options.map((tile) =>
      Math.exp(-(nearest(tile.coord, reach) - 1) / DISTANCE_TAU),
    );

    const tile = weightedPick(options, weights, random);
    chosen.push(tile);
    available.splice(available.indexOf(tile), 1);
  }

  return chosen.map((tile) => coordToKey(tile.coord));
};

/**
 * Scores a move without applying it: tiles captured, enemy tiles neutralized and capitals destroyed.
 *
 * @param grid - Current hex grid state.
 * @param keys - Keys of the tiles the move would select.
 * @param player - The player making the move.
 * @returns The score. A move that captures nothing scores 0.
 */
const scoreMove = (
  grid: HexTileData[][],
  keys: string[],
  player: Player,
): number => {
  const capturable = getCapturableKeys(grid, new Set(keys), player);
  const neutralized = getNeutralizedKeys(grid, capturable, player);

  let score = capturable.size;
  for (const key of neutralized) {
    const tile = getTile(grid, keyToCoord(key))!;
    if (typeof tile.status !== "number") continue;
    score += tile.isCapital ? CAPITAL_SCORE : ENEMY_TILE_SCORE;
  }
  return score;
};

/**
 * Chooses a move for the bot.
 *
 * Picks tiles near the bot's territory to pay attention to, finds words that can be spelt from them, and then randomly keeps or drops each one, with a bias towards keeping the more common words. This models which words the bot knows.
 *
 * The words kept are placed on the tiles and rated by how much they capture plus how common the word is. One is picked with a softmax, to simulate human's imperfection.
 *
 * @param grid - Current hex grid state.
 * @param player - The player the bot is playing.
 * @param dictionary - The dictionary to find words in.
 * @param random - Returns a number in [0, 1).
 * @returns The keys of the tiles to select, in word order, or `null` if no word can be spelt.
 */
export const chooseMove = (
  grid: HexTileData[][],
  player: Player,
  dictionary: Dictionary,
  random: () => number = Math.random,
): string[] | null => {
  const tiles = grid.flat();
  const selectable = tiles.filter(isSelectable);
  const owned = tiles
    .filter((tile) => tile.status === player)
    .map((tile) => tile.coord);

  let pool = attentionPool(selectable, owned, random);
  let words = dictionary.findWords(lettersOf(pool));

  if (words.length === 0) {
    pool = selectable;
    words = dictionary.findWords(lettersOf(pool));
  }
  if (words.length === 0) return null;

  const candidates = recallWords(
    words,
    dictionary,
    CANDIDATE_WORDS,
    random,
  ).map((word) => ({ word, keys: placeWord(word, pool, owned, random) }));
  const appeals = candidates.map(
    ({ word, keys }) =>
      scoreMove(grid, keys, player) +
      FAMILIARITY_BONUS * dictionary.commonness(word),
  );

  const best = Math.max(...appeals);
  const weights = appeals.map((appeal) =>
    Math.exp((appeal - best) / TEMPERATURE),
  );
  return weightedPick(candidates, weights, random).keys;
};
