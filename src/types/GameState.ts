import { GameEvent } from "@/types/GameEvent";
import { HexTileData, Player } from "@/types/HexTile";

export type GameState = {
  grid: HexTileData[][];
  turn: number;
  currentPlayer: Player;
  starter: Player;
  wins: Record<Player, number>;
  pendingCapitals: Player[];
  firstPasser: Player | null;
  events: GameEvent[];
};

export type PassReason = "timeout" | "pass";

export type Move =
  { type: "submit"; keys: string[] } | { type: "pass"; reason: PassReason };

export type MoveError =
  "game-over" | "empty-selection" | "invalid-tiles" | "invalid-word";

export type MoveResult =
  { ok: true; state: GameState } | { ok: false; reason: MoveError };
