/** How many characters a room code has. */
export const ROOM_CODE_LENGTH = 6;

/** THe characters to generate room codes from. */
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generates a random room code.
 *
 * @returns A code of `ROOM_CODE_LENGTH` characters from `ROOM_CODE_ALPHABET`.
 */
export const generateRoomCode = (): string => {
  const randomNumbers = crypto.getRandomValues(
    new Uint32Array(ROOM_CODE_LENGTH),
  );

  const indices = Array.from(
    randomNumbers,
    (number) => number % ROOM_CODE_ALPHABET.length,
  );
  return indices.map((index) => ROOM_CODE_ALPHABET[index]).join("");
};

/**
 * Cleans up and validates typed room codes.
 *
 * @param input - The code as typed. Surrounding cases and letter case are ignored.
 * @returns The code in uppercase, or `null` if it is not a valid room code.
 */
export const normalizeRoomCode = (input: string): string | null => {
  const code = input.trim().toUpperCase();
  if (code.length !== ROOM_CODE_LENGTH) return null;
  for (const character of code) {
    if (!ROOM_CODE_ALPHABET.includes(character)) return null;
  }
  return code;
};
