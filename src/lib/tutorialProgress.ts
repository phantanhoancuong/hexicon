import { createSetting } from "@/lib/createSetting";
import { isBoolean } from "@/lib/guards";

export const useTutorialDone = createSetting<boolean>(
  "tutorialDone",
  false,
  isBoolean,
);
