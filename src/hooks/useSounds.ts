import { useCallback } from "react";

import { useVolume } from "@/lib/settings";
import type { SoundName } from "@/lib/sounds";
import { playSound } from "@/lib/sounds";

export const useSounds = () => {
  const [volume] = useVolume();

  return useCallback(
    (name: SoundName, step?: number): void =>
      playSound(name, step, volume / 100),
    [volume],
  );
};
