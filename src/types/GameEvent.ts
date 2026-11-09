import { Player } from "@/types/HexTile";

export type GameEvent =
  | { type: "timeout"; player: Player }
  | { type: "pass"; player: Player }
  | { type: "played"; player: Player; word: string; keys: string[] }
  | { type: "capital-captured"; captor: Player; loser: Player }
  | { type: "capital-reformed"; player: Player }
  | { type: "redeal"; reason: "all-passed" | "no-playable-word" };
