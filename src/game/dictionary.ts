export type Dictionary = { has: (word: string) => boolean };

const WORDS_URL = "/dictionary/dictionary.txt";

const normalize = (word: string): string => word.trim().toUpperCase();

/**
 * Builds a dictionary from a list of words. Words are trimmed and blank entries are skipped.
 *
 * @param words - The word list.
 * @returns A dictionary which `has` function that normalizes case and surrounding whitespace.
 */
export const createDictionary = (words: string[]): Dictionary => {
  const set = new Set<string>();
  for (const word of words) {
    const normalized = normalize(word);
    if (normalized) set.add(normalized);
  }
  return { has: (word) => set.has(normalize(word)) };
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
