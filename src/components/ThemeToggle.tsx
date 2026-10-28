"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const THEMES = ["system", "light", "dark"] as const;

const subscribe = () => () => {};

/** Header button that cycles the theme through `system`, `light` and `dark`. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const current = THEMES.find((t) => t === theme) ?? "system";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  return (
    <button
      className="h-8 w-20 cursor-pointer rounded-md border border-border font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => setTheme(next)}
      aria-label={
        mounted ? `Theme: ${current}. Switch to ${next}.` : "Switch theme"
      }
    >
      {mounted ? current.toUpperCase() : ""}
    </button>
  );
}
