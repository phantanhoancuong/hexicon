export type Dictionary = { has: (word: string) => boolean };

const WORDS_URL = "/dictionary/dictionary.txt";

const normalize = (word: string): string => word.trim().toUpperCase();

export const createDictionary = (words: string[]): Dictionary => {
  const set = new Set<string>();
  for (const word of words) {
    const normalized = normalize(word);
    if (normalized) set.add(normalized);
  }
  return { has: (word) => set.has(normalize(word)) };
};

export const loadDictionary = async (): Promise<Dictionary> => {
  const response = await fetch(WORDS_URL);
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  const text = await response.text();
  return createDictionary(text.split("\n"));
};
