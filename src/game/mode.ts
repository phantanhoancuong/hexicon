/** The game modes to play. */
export const MODES = ["online", "local", "bot"] as const;
export type Mode = (typeof MODES)[number];
