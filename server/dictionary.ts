import commonText from "@public/dictionary/common.txt";
import uncommonText from "@public/dictionary/uncommon.txt";

import { createDictionary, Dictionary } from "@/game/dictionary";

let cached: Dictionary | null = null;

export const getDictionary = (): Dictionary => {
  cached ??= createDictionary(commonText.split("\n"), uncommonText.split("\n"));
  return cached;
};
