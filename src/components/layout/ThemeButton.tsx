"use client";

import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/useMounted";

const THEMES = ["system", "light", "dark"] as const;

/** Header button for the theme that cycles the theme through `system`, `light` and `dark`. */
export default function ThemeButton() {
  const { theme, setTheme } = useTheme();

  const mounted = useMounted();

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
