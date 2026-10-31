"use client";

import { useEffect } from "react";

import { loadDictionary } from "@/game/dictionary";

/**
 * Starts loading the dictionary in the background.
 *
 * Doesn't return anything.
 */
export default function DictionaryPreload() {
  useEffect(() => {
    loadDictionary().catch(() => {});
  }, []);

  return null;
}
