import { PLAYERS, TURN_SECONDS, turnMsFor } from "@/game/constants";

/** How many players can be in a room. There is one player for each side. */
export const MAX_PLAYERS = PLAYERS.length;

/** Internal path the worker uses to claim a room code for a new room. */
export const CLAIM_PATH = "/claim";

/** How long a room is maintained before its storage is deleted when nobody is connected. */
export const EMPTY_ROOM_SECONDS = 600;

/** How long a turn lasts, in milliseconds, for a game that was stored without its own turn length. */
export const TURN_MS = turnMsFor(TURN_SECONDS);
