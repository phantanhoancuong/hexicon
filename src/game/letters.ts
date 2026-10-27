import { LETTER_POOL } from "@/game/constants";

/**
 * Picks a random letter on a weighted frequency scale.
 *
 * @returns A single uppercase letter.
 */
export const pickRandomLetter = (): string =>
  LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)];

export const shuffle = <T>(items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};
