import {
  isYou,
  Perspective,
  playerName,
  playerNameMidSentence,
} from "@/game/names";

import { GameEvent } from "@/types/GameEvent";
import { Player } from "@/types/HexTile";

const describeEvent = (event: GameEvent, perspective?: Perspective): string => {
  const name = (player: Player): string => playerName(player, perspective);
  const nameMid = (player: Player): string =>
    playerNameMidSentence(player, perspective);
  const verb = (player: Player, you: string, other: string): string =>
    isYou(player, perspective) ? you : other;

  switch (event.type) {
    case "timeout":
      return `${name(event.player)} timed out`;
    case "pass":
      return `${name(event.player)} passed`;
    case "played":
      return `${name(event.player)} played ${event.word}`;
    case "capital-captured":
      return `Capital captured, ${nameMid(event.captor)} ${verb(event.captor, "go", "goes")} again`;
    case "capital-reformed":
      return `${name(event.player)} ${verb(event.player, "get", "gets")} a new capital`;
    case "redeal":
      return event.reason === "all-passed"
        ? "Everyone passed, new letters"
        : "No words left, new letters";
  }
};

const PRIORITY: GameEvent["type"][] = [
  "redeal",
  "capital-captured",
  "played",
  "timeout",
  "pass",
  "capital-reformed",
];

/**
 * Picks the most important notice and words it.
 *
 * @param events - The notices for this turn.
 * @param botPlayer - The player the bot controls. Leave out for local play.
 * @returns The message to show, or an empty string if there is none.
 */
/**
 * Picks out the most important notice and dresses it up.
 *
 * @param events - The notices for this turn.
 * @param botPlayer - Optional player the bot controls.
 * @returns The message to show, or `""` if there is none.
 */
export const describeEvents = (
  events: GameEvent[],
  perspective?: Perspective,
): string => {
  for (const type of PRIORITY) {
    const event = events.find((e) => e.type === type);
    if (event) return describeEvent(event, perspective);
  }
  return "";
};
