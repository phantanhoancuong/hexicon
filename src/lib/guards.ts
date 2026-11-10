/** If a value is a boolean. */
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

/** If a value is a plain object (not `null` and not an array). */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
