/**
 * Toggles a tile between selected and unselected.
 *
 * @param keys - The keys of the selected tiles, in the order they were picked.
 * @param key - The key of the tile to toggle.
 * @returns A new set of selected keys.
 */
export const toggleKey = (
  keys: ReadonlySet<string>,
  key: string,
): Set<string> => {
  const next = new Set(keys);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
};
