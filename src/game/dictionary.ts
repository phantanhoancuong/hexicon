import { pickRandomLetter, shuffle } from "@/game/letters";

const COMMON_URL = "/dictionary/common.txt";
const UNCOMMON_URL = "/dictionary/uncommon.txt";

const MIN_WORD_LENGTH = 2;

const PLANT_MIN_LENGTH = 3;
const PLANT_MAX_LENGTH = 12;

const CODE_A = 65;
const ALPHABET_SIZE = 26;

/** How quickly commonness falls with rank. */
const COMMONNESS_FALLOFF = 8000;

export type Dictionary = {
  /** If a word is in the dictionary. Ignores case and surrounding spaces. */
  has: (word: string) => boolean;

  /** If at least one word can be spelt using some or all of the letters. */
  canSpellFrom: (letters: string) => boolean;

  /** Every word that can be spelt using some or all of the letters. */
  findWords: (letters: string) => string[];

  /**
   * Rates how well known a word is.
   *
   * @param word - The word to rate. Ignores case and surrounding spaces.
   * @returns A number from 0 to 1. The most common word is 1, less common words are lower, and words outside the common list are 0.
   */
  commonness: (word: string) => number;

  /**
   * Makes letters for neutral tiles, guaranteed to contain at least one valid word.
   *
   * @param count - How many letters to make.
   * @returns `count` letters in random order, containing the letters of one dictionary word whenever `count` is at least 2.
   */
  dealLetters: (count: number) => string[];

  /** If a word is in the common list. Ignores case and surrounding spaces. */
  isCommon: (word: string) => boolean;
};

/** Trims a word and uppercases it so it matches the dictionary's format. */
const normalize = (word: string): string => word.trim().toUpperCase();

/** Counts how many times each letter A-Z appears, indexed from A. */
const countLetters = (letters: string): number[] => {
  const counts = new Array<number>(ALPHABET_SIZE).fill(0);
  for (const letter of letters) {
    const index = letter.charCodeAt(0) - CODE_A;
    if (index >= 0 && index < ALPHABET_SIZE) counts[index]++;
  }
  return counts;
};

/**
 * Checks if a word can be spelt from the letter counts.
 *
 * @param word - An uppercase word of letters A-Z.
 * @param counts - How many of each letter are available, from {@link countLetters}.
 * @returns `true` if the word fits.
 */
const fits = (word: string, counts: number[]): boolean => {
  let used = 0;
  let ok = true;
  for (; used < word.length; used++) {
    const index = word.charCodeAt(used) - CODE_A;
    if (counts[index] === 0) {
      ok = false;
      break;
    }
    counts[index]--;
  }

  for (let i = 0; i < used; i++) counts[word.charCodeAt(i) - CODE_A]++;
  return ok;
};

/**
 * Checks if a word is in a list sorted in ascending order.
 *
 * @param sorted - A sorted list of strings.
 * @param word - An uppercase word.
 * @returns `true` if the word is in the list.
 */
const binarySearch = (sorted: string[], word: string): boolean => {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const candidate = sorted[middle];
    if (candidate === word) return true;
    if (candidate < word) low = middle + 1;
    else high = middle - 1;
  }
  return false;
};

/**
 * Builds a dictionary from the common and uncommon word lists produced by the build script.
 *
 * Entries shorter than the minimum length, such as a trailing blank line, are skipped.
 *
 * @param commonWords - List of common words, sorted from most common to least common.
 * @param uncommonWords - List of remaining valid words, sorted in ascending order. Defaults to none. The lists must NOT share words.
 * @returns A dictionary for looking up words, finding words that can be spelt from a set of letters, and dealing letters.
 */
export const createDictionary = (
  commonWords: string[],
  uncommonWords: string[] = [],
): Dictionary => {
  const ranked = commonWords.filter((word) => word.length >= MIN_WORD_LENGTH);
  const uncommon = uncommonWords.filter(
    (word) => word.length >= MIN_WORD_LENGTH,
  );
  const playable = ranked.concat(uncommon);
  const ranks = new Map(ranked.map((word, rank) => [word, rank]));

  const buckets: string[][] = Array.from(
    { length: PLANT_MAX_LENGTH + 1 },
    () => [],
  );

  for (const word of playable) {
    if (word.length <= PLANT_MAX_LENGTH) buckets[word.length].push(word);
  }

  return {
    has: (word) => {
      const normalized = normalize(word);
      return ranks.has(normalized) || binarySearch(uncommon, normalized);
    },

    canSpellFrom: (letters) => {
      const counts = countLetters(normalize(letters));
      return playable.some((word) => fits(word, counts));
    },

    findWords: (letters) => {
      const counts = countLetters(normalize(letters));
      return playable.filter((word) => fits(word, counts));
    },

    commonness: (word) => {
      const rank = ranks.get(normalize(word));
      return rank === undefined ? 0 : Math.exp(-rank / COMMONNESS_FALLOFF);
    },

    dealLetters: (count) => {
      const letters: string[] = [];

      const maxLength = Math.min(PLANT_MAX_LENGTH, count);
      const minLength = Math.min(PLANT_MIN_LENGTH, maxLength);
      if (maxLength >= MIN_WORD_LENGTH) {
        const length =
          minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
        const bucket = buckets[length];
        if (bucket.length > 0) {
          const word = bucket[Math.floor(Math.random() * bucket.length)];
          letters.push(...word.split(""));
        }
      }

      while (letters.length < count) letters.push(pickRandomLetter());
      return shuffle(letters);
    },

    isCommon: (word: string): boolean => ranks.has(normalize(word)),
  };
};

let cachedPromise: Promise<Dictionary> | null = null;
let cachedDictionary: Dictionary | null = null;

/**
 * Fetches a word list file.
 *
 * @param url - The word list file to fetch.
 * @returns The entries of the file, organized by one per line.
 * @throws If the file cannot be fetched.
 */
const fetchWordList = async (url: string): Promise<string[]> => {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Could not load ${url}: ${response.status}`);
  return (await response.text()).split("\n");
};

/**
 * Fetches the common and uncommon word lists and builds a dictionary.
 *
 * @returns The dictionary.
 * @throws If either word list cannot be fetched.
 */
const fetchDictionary = async (): Promise<Dictionary> => {
  const [commonWords, uncommonWords] = await Promise.all([
    fetchWordList(COMMON_URL),
    fetchWordList(UNCOMMON_URL),
  ]);
  return createDictionary(commonWords, uncommonWords);
};

/**
 * Fetches and caches the dictionary (common and uncommon words).
 *
 * @returns The dictionary.
 * @throws If either word list cannot be fetched.
 */
export const loadDictionary = (): Promise<Dictionary> => {
  cachedPromise ??= fetchDictionary()
    .then((dictionary) => {
      cachedDictionary = dictionary;
      return cachedDictionary;
    })
    .catch((error) => {
      cachedPromise = null;
      throw error;
    });
  return cachedPromise;
};

/**
 * Returns the dictionary if it has already loaded, or `null` if it's not loaded yet.
 */
export const getDictionary = (): Dictionary | null => cachedDictionary;
