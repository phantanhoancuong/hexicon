"use client";

import { Toggle } from "@/components/ui";

import { useAlternate } from "@/lib/settings";

/** Menu toggle for option if the player to play the first turn alternates between games. */
export default function AlternateOption() {
  const [alternate, setAlternate] = useAlternate();

  return (
    <Toggle
      label="ALTERNATE FIRST TURN"
      description="Players take turns going first between each new game."
      checked={alternate}
      onChange={setAlternate}
    />
  );
}
