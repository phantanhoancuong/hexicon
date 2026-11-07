import { createSetting } from "@/lib/createSetting";

import { DIFFICULTIES, Difficulty } from "@/game/difficulty";
import { MODES, Mode } from "@/game/mode";

/** If the screen flips each turn in local play. `null` means the player has not chosen yet. */
export const useFlip = createSetting(
  "flip",
  null,
  (value) => value === null || typeof value === "boolean",
);

/** The bot's difficulty. */
export const useDifficulty = createSetting<Difficulty>(
  "difficulty",
  "medium",
  (value): value is Difficulty =>
    typeof value === "string" && DIFFICULTIES.some((level) => level === value),
);

/** The selected game mode */
export const useMode = createSetting<Mode>(
  "mode",
  "bot",
  (value): value is Mode =>
    typeof value === "string" && MODES.some((mode) => mode === value),
);

/** If the first turn belongs to alternating players between matches. */
export const useAlternate = createSetting<boolean>(
  "alternate",
  true,
  (value): value is boolean => typeof value === "boolean",
);
