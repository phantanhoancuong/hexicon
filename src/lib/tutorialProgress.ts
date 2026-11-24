import { createSetting } from "@/lib/createSetting";
import { isBoolean } from "@/lib/guards";

export const useTutorialDone = createSetting<boolean>(
  "tutorialDone",
  false,
  isBoolean,
);

export const useHelpSeen = createSetting<boolean>("helpSeen", false, isBoolean);
