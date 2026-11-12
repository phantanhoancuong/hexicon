import { useCallback } from "react";

import { useSound } from "@/lib/settings";
import type { SoundName } from "@/lib/sounds";
import { playSound } from "@/lib/sounds";

export const useSounds = () => {
  const [enabled] = useSound();

  return useCallback(
    (name: SoundName, step?: number): void => {
      if (enabled) playSound(name, step);
    },
    [enabled],
  );
};
