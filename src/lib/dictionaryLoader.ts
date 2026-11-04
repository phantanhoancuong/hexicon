import { createDictionary, Dictionary } from "@/game/dictionary";

const COMMON_URL = "/dictionary/common.txt";
const UNCOMMON_URL = "/dictionary/uncommon.txt";

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
