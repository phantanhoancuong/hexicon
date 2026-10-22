import { useEffect, useState } from "react";

import { Dictionary, loadDictionary } from "@/game/dictionary";

type DictionaryState =
  | { status: "loading" }
  | { status: "ready"; dictionary: Dictionary }
  | { status: "error" };

/**
 * Load the word list and expose a word check.
 *
 * @returns `status` of the load, and `isValidWord` (returns `false` until the list is ready).
 */
export const useWordValidator = (): {
  status: DictionaryState["status"];
  isValidWord: (word: string) => boolean;
} => {
  const [dictionaryState, setDictionaryState] = useState<DictionaryState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const dictionary = await loadDictionary();
        if (!cancelled) setDictionaryState({ status: "ready", dictionary });
      } catch (error) {
        console.error(error);
        if (!cancelled) setDictionaryState({ status: "error" });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const isValidWord = (word: string): boolean =>
    dictionaryState.status === "ready" && dictionaryState.dictionary.has(word);

  return { status: dictionaryState.status, isValidWord };
};
