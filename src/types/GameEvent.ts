import { Player } from "@/types/HexTile";

export type GameEvent =
  | { type: "timeout"; player: Player }
  | { type: "capital-captured"; captor: Player; loser: Player }
  | { type: "capital-reformed"; player: Player }
  | { type: "redeal"; reason: "all-passed" | "no-playable-word" };
