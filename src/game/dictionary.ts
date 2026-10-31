import { pickRandomLetter, shuffle } from "@/game/letters";

const WORDS_URL = "/dictionary/dictionary.txt";
const COMMON_URL = "/dictionary/common.txt";

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
 * Builds a dictionary from a cleaned word list produced by the build script.
 *
 * Entries shorter than the minimum length, such as a trailing blank line, are skipped.
 *
 * @param words - The word list.
 * @param commonWords - The common word list sorted by frequency.
 * @returns A dictionary for looking up words, finding words that can be spelt from a set of letters, and dealing letters.
 */
export const createDictionary = (
  words: string[],
  commonWords: string[] = [],
): Dictionary => {
  const playable = words.filter((word) => word.length >= MIN_WORD_LENGTH);
  const set = new Set(playable);
  const ranked = commonWords.filter((word) => word.length >= MIN_WORD_LENGTH);
  const ranks = new Map(ranked.map((word, rank) => [word, rank]));

  const buckets: string[][] = Array.from(
    { length: PLANT_MAX_LENGTH + 1 },
    () => [],
  );

  for (const word of playable) {
    if (word.length <= PLANT_MAX_LENGTH) buckets[word.length].push(word);
  }

  return {
    has: (word) => set.has(normalize(word)),

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
  };
};

let cachedPromise: Promise<Dictionary> | null = null;
let cachedDictionary: Dictionary | null = null;

/**
 * Fetches the word list and the common word list and builds a dictionary.
 *
 * If the common list is missing, the dictionary doesn't treat any word as common.
 *
 * @returns The dictionary.
 * @throws If the word list file cannot be fetched.
 */
const fetchDictionary = async (): Promise<Dictionary> => {
  const [wordsResponse, commonResponse] = await Promise.all([
    fetch(WORDS_URL),
    fetch(COMMON_URL),
  ]);

  if (!wordsResponse.ok)
    throw new Error(`Could not load words: ${wordsResponse.status}`);

  const words = (await wordsResponse.text()).split("\n");
  const common = commonResponse.ok
    ? (await commonResponse.text()).split("\n")
    : [];
  return createDictionary(words, common);
};

/**
 * Fetches and caches the dictionary (words + commons).
 *
 * @returns The dictionary.
 * @throws If the word list cannot be fetched.
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
