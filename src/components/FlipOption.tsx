"use client";

import Toggle from "@/components/Toggle";
import { useFlip } from "@/lib/settings";

export default function FlipOption() {
  const [flip, setFlip] = useFlip();

  return (
    <Toggle
      label="AUTO FLIP"
      description="Flips the screen on player 2's turn."
      checked={flip === true}
      onChange={setFlip}
    />
  );
}
