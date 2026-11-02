"use client";

import Toggle from "@/components/Toggle";
import { useAlternate } from "@/lib/settings";

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
