export const ROOM_CODE_LENGTH = 6;

export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

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

export const normalizeRoomCode = (input: string): string | null => {
  const code = input.trim().toUpperCase();
  if (code.length !== ROOM_CODE_LENGTH) return null;
  for (const character of code) {
    if (!ROOM_CODE_ALPHABET.includes(character)) return null;
  }
  return code;
};
