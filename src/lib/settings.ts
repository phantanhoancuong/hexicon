import { createSetting } from "@/lib/createSetting";
import { isBoolean } from "@/lib/guards";

import {
  isTurnSeconds,
  TURN_SECONDS,
  type TurnSeconds,
} from "@/game/constants";
import { DIFFICULTIES, Difficulty } from "@/game/difficulty";
import { Mode, MODES } from "@/game/mode";

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

/** If the screen flips each turn in local play. */
export const useFlip = createLocalSetting("flip", false, isBoolean);

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

export const useVolume = createSetting(
  "volume",
  100,
  (value): value is number =>
    typeof value === "number" && value >= 0 && value <= 100,
);

export const useColorBlind = createSetting("colorBlind", false, isBoolean);

/**
 * Makes a setting that each mode saves separately, such as `local:alternate`, `bot:alternate` and `online:alternate`.
 *
 * Call this once at the top of a file and NOT in a component.
 *
 * @param name - The name of the setting, without the mode.
 * @param defaultValue - The value used until the player changes it, and whenever nothing valid is saved.
 * @param validate - If a value read from storage is acceptable.
 * @returns A hook that takes a mode and returns that mode's value and a function to set it.
 */
const createSettingPerMode = <T>(
  name: string,
  defaultValue: T,
  validate: (value: unknown) => value is T,
) => {
  const byMode = {
    local: createLocalSetting(name, defaultValue, validate),
    bot: createBotSetting(name, defaultValue, validate),
    online: createOnlineSetting(name, defaultValue, validate),
  } satisfies Record<Mode, unknown>;

  return (mode: Mode) => byMode[mode]();
};

/** If the first turn belongs to alternating players between matches. */
export const useAlternate = createSettingPerMode("alternate", true, isBoolean);

/** How long a turn lasts, in seconds. */
export const useTurnSeconds = createSettingPerMode<TurnSeconds>(
  "turnSeconds",
  TURN_SECONDS,
  isTurnSeconds,
);
