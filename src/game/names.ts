import { Player } from "@/types/HexTile";

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
export const playerName = (player: Player, botPlayer?: Player): string => {
  if (botPlayer === undefined) return `Player ${player}`;
  return player === botPlayer ? "Bot" : "Player";
};
