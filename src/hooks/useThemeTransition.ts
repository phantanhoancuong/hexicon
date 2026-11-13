"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

export function useThemeTransition() {
  const { theme, setTheme } = useTheme();

  const changeTheme = (next: string) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !document.startViewTransition) {
      setTheme(next);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  };

  return { theme, setTheme: changeTheme };
}
