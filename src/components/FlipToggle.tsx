"use client";

import { usePathname } from "next/navigation";

import { useFlip } from "@/lib/settings";

export default function FlipToggle() {
  const pathname = usePathname();
  const [flip, setFlip] = useFlip();

  if (pathname !== "/play/local") return null;

  const isOn = flip === true;

  return (
    <button
      className={`h-8 cursor-pointer rounded-md border px-3 font-mono text-xs tracking-wide transition-colors ${
        isOn
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setFlip(!isOn)}
      aria-pressed={isOn}
      aria-label="Flip the screen toward the player whose turn it is"
    >
      AUTO FLIP
    </button>
  );
}
