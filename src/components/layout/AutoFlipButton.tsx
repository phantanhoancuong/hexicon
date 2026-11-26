"use client";

import { usePathname } from "next/navigation";

import { useFlip } from "@/lib/settings";

/**
 * Header button for AUTO FLIP in local play.
 *
 * Chooses if the screen turns around, towards the player on the other side of the device on local play.
 */
export default function AutoFlipButton() {
  const pathname = usePathname();
  const [isOn, setFlip] = useFlip();

  if (pathname !== "/play/local") return null;

  return (
    <button
      className={`h-8 cursor-pointer rounded-md border-2 px-3 font-mono text-xs font-semibold tracking-wide transition-colors ${
        isOn
          ? "border-accent bg-accent text-accent-foreground"
          : "border-muted-foreground text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setFlip(!isOn)}
      aria-pressed={isOn}
      aria-label="Flip the screen toward the player whose turn it is"
    >
      AUTO FLIP
    </button>
  );
}
