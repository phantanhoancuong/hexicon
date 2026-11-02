export const MODES = ["local", "bot"] as const;

export type Mode = (typeof MODES)[number];
