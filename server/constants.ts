import { TURN_PAUSE_MS, TURN_SECONDS } from "@/game/constants";

/** How many players can be in a room. */
export const MAX_PLAYERS = 2;

/** Storage key of the list of player tokens. Order is the order the players joined. */
export const TOKENS_KEY = "tokens";

/** Storage key of the side each player has taken. */
export const SIDES_KEY = "sides";

/** Storage key of the flag that says the room was made by `POST /rooms`. Joining a room without this flag is refused. */
export const CREATED_KEY = "created";

/** Storage key of the game being played in the room. Kept after the game ends so the players can play again. */
export const GAME_KEY = "game";

/** Internal path the worker uses to claim a room code for a new room. */
export const CLAIM_PATH = "/claim";

/** How long a room is maintained before its storage is deleted when nobody is connected. */
export const EMPTY_ROOM_SECONDS = 600;

/** How long a turn lasts, including the pause before the clock runs. */
export const TURN_MS = TURN_PAUSE_MS + TURN_SECONDS * 1000;
