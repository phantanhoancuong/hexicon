import { createSetting } from "@/lib/createSetting";
import { isBoolean } from "@/lib/guards";

import { DIFFICULTIES, Difficulty } from "@/game/difficulty";
import { MODES, Mode } from "@/game/mode";

/**
 * Makes a version of `createSetting()` with scoped mode.
 *
 * A setting created with this is saved under a key that starts with the mode, such as `bot:difficulty`.
 *
 * @param mode - The mode the settings belong to.
 * @returns A `createSetting()` for a particular mode.
 */
const createModeSetting =
  (mode: Mode) =>
  <T>(
    name: string,
    defaultValue: T,
    validate: (value: unknown) => value is T,
  ) =>
    createSetting(`${mode}:${name}`, defaultValue, validate);

const createLocalSetting = createModeSetting("local");
const createBotSetting = createModeSetting("bot");
const createOnlineSetting = createModeSetting("online");

/** If the screen flips each turn in local play. `null` means the player has not chosen yet. */
export const useFlip = createLocalSetting(
  "flip",
  null,
  (value) => value === null || typeof value === "boolean",
);

/** The bot's difficulty. */
export const useDifficulty = createBotSetting<Difficulty>(
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

/** The modes that have ALTERNATE FIRST TURN setting. */
export type AlternateMode = Mode;

const alternateByMode = {
  local: createLocalSetting("alternate", true, isBoolean),
  bot: createBotSetting("alternate", true, isBoolean),
  online: createOnlineSetting("alternate", true, isBoolean),
} satisfies Record<AlternateMode, unknown>;

/** If the first turn belongs to alternating players between matches. */
export const useAlternate = (mode: AlternateMode) => alternateByMode[mode]();

export const useSound = createSetting("sound", true, isBoolean);
