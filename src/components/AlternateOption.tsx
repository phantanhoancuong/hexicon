"use client";

import Toggle from "@/components/Toggle";
import { useAlternate } from "@/lib/settings";

export default function AlternateOption() {
  const [alternate, setAlternate] = useAlternate();

  return (
    <Toggle
      label="ALTERNATE FIRST TURN"
      badge="WIP"
      description="The first turn alternates between players between each match."
      checked={alternate}
      onChange={setAlternate}
    />
  );
}
