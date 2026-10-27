import { pickRandomLetter, shuffle } from "@/game/letters";

const WORDS_URL = "/dictionary/dictionary.txt";

const MIN_WORD_LENGTH = 2;

const PLANT_MIN_LENGTH = 3;
const PLANT_MAX_LENGTH = 8;

const CODE_A = 65;
const ALPHABET_SIZE = 26;

export type Dictionary = {
  has: (word: string) => boolean;
  canSpellFrom: (letters: string) => boolean;
  dealLetters: (count: number) => string[];
};

const normalize = (word: string): string => word.trim().toUpperCase();

const countLetters = (letters: string): number[] => {
  const counts = new Array<number>(ALPHABET_SIZE).fill(0);
  for (const letter of letters) {
    const index = letter.charCodeAt(0) - CODE_A;
    if (index >= 0 && index < ALPHABET_SIZE) counts[index]++;
  }
  return counts;
};

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
 * Builds a dictionary from a list of words. Words are trimmed and blank entries are skipped.
 *
 * @param words - The word list.
 * @returns A dictionary that can look up words, check that `letters` can spell a word, and deal letters.
 */
export const createDictionary = (words: string[]): Dictionary => {
  const set = new Set<string>();
  for (const word of words) {
    const normalized = normalize(word);
    if (normalized) set.add(normalized);
  }

  const playable = [...set].filter(
    (word) => word.length >= MIN_WORD_LENGTH && /^[A-Z]+$/.test(word),
  );

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

/**
 * Fetches the word list and builds a dictionary.
 *
 * @returns The dictionary.
 * @throws If the word list file cannot be fetched.
 */
export const loadDictionary = async (): Promise<Dictionary> => {
  const response = await fetch(WORDS_URL);
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  const text = await response.text();
  return createDictionary(text.split("\n"));
};
