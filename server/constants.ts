import { PLAYERS, TURN_SECONDS, turnMsFor } from "@/game/constants";

/** How many players can be in a room. There is one player for each side. */
export const MAX_PLAYERS = PLAYERS.length;

/** Storage key of the list of player tokens. Order is the order the players joined. */
export const TOKENS_KEY = "tokens";

/** Storage key of the side each player has taken. */
export const SIDES_KEY = "sides";

/** Storage key of the flag that says the room was made by `POST /rooms`. Joining a room without this flag is refused. */
export const CREATED_KEY = "created";

/** Storage key of ALTERNATE FIRST TURN setting. */
export const ALTERNATE_KEY = "alternate";

/** Storage key of the game being played in the room. Kept after the game ends so the players can play again. */
export const GAME_KEY = "game";

/** Internal path the worker uses to claim a room code for a new room. */
export const CLAIM_PATH = "/claim";

/** How long a room is maintained before its storage is deleted when nobody is connected. */
export const EMPTY_ROOM_SECONDS = 600;

/** Storage key of the number of seconds each turn lasts. */
export const TURN_SECONDS_KEY = "turnSeconds";

/** How long a turn lasts, in milliseconds, for a game that was stored without its own turn length. */
export const TURN_MS = turnMsFor(TURN_SECONDS);
