import { Player } from "@/types/HexTile";

export type Perspective =
  | { kind: "local" }
  | { kind: "bot"; bot: Player }
  | { kind: "online"; you: Player };

export const LOCAL: Perspective = { kind: "local" };

/**
 * The name to show for a player.
 *
 * In a game against the bot the two sides are "Player" and "Bot".
 * In local play they are "Player 1" and "Player 2".
 *
 * @param player - The player to name.
 * @param botPlayer - Optional player the bot controls.
 * @returns The name to show.
 */
export const playerName = (
  player: Player,
  perspective: Perspective = LOCAL,
): string => {
  switch (perspective.kind) {
    case "local":
      return `Player ${player}`;
    case "bot":
      return player === perspective.bot ? "Bot" : "Player";
    case "online":
      return player === perspective.you ? "You" : "Opponent";
  }
};

export const playerNameMidSentence = (
  player: Player,
  perspective: Perspective = LOCAL,
): string => {
  const name = playerName(player, perspective);
  return perspective.kind === "online" ? name.toLowerCase() : name;
};

export const isYou = (
  player: Player,
  perspective: Perspective = LOCAL,
): boolean => perspective.kind === "online" && perspective.you === player;
