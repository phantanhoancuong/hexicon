import { createSetting } from "@/lib/createSetting";

/** If the screen flips each turn in local play. `null` means the player has not chosen yet. */
export const useFlip = createSetting(
  "flip",
  null,
  (value) => value === null || typeof value === "boolean",
);
