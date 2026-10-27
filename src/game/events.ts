import { GameEvent } from "@/types/GameEvent";

const describeEvent = (event: GameEvent): string => {
  switch (event.type) {
    case "timeout":
      return `Player ${event.player} timed out`;
    case "capital-captured":
      return `Capital captured, Player ${event.captor} goes again`;
    case "capital-reformed":
      return `Player ${event.player} gets a new capital`;
    case "redeal":
      return event.reason === "all-passed"
        ? "Everyone passed, new letters"
        : "No words left, new letters";
  }
};

const PRIORITY: GameEvent["type"][] = [
  "redeal",
  "capital-captured",
  "timeout",
  "capital-reformed",
];

export const describeEvents = (events: GameEvent[]): string => {
  for (const type of PRIORITY) {
    const event = events.find((e) => e.type === type);
    if (event) return describeEvent(event);
  }
  return "";
};
