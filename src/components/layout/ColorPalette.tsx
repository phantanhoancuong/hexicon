"use client";

import { useEffect } from "react";

import { useColorBlind } from "@/lib/settings";

export default function ColorPalette() {
  const [colorBlind] = useColorBlind();

  useEffect(() => {
    document.documentElement.dataset.palette = colorBlind
      ? "color-blind"
      : "default";
  }, [colorBlind]);

  return null;
}
