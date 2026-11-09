"use client";

import { Toggle } from "@/components/ui";

import { useFlip } from "@/lib/settings";

/**
 * Menu switch for AUTO FLIP in local play.
 *
 * Chooses if the screen turns around, towards the player on the other side of the device on local play.
 */
export default function AutoFlipSwitch() {
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
