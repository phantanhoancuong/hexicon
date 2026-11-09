import { getServerByName, routePartykitRequest } from "partyserver";

import { generateRoomCode } from "@/online/roomCode";

import { CLAIM_PATH } from "./constants";
import type { Env } from "./room/Room";

export { Room } from "./room/Room";

/** How many codes to try when creating a room, in case a generated code is already taken. */
const MAX_CREATE_ATTEMPTS = 5;

/** Lets the website call the server. */
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

/**
 * Makes a new game room with a generated random code.
 *
 * @param env - The worker's bindings.
 * @returns The new code as `{ code }`, or `503` if every attempt was not successful.
 */
const createRoom = async (env: Env): Promise<Response> => {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    const room = await getServerByName(env.Main, code);
    const claim = await room.fetch(
      new Request(`https://room${CLAIM_PATH}`, { method: "POST" }),
    );
    if (claim.ok) return Response.json({ code }, { headers: CORS_HEADERS });
  }
  return new Response("Could not create a room", {
    status: 503,
    headers: CORS_HEADERS,
  });
};

/**
 * The worker:
 * - `POST /rooms` makes a room.
 * - The rest of the requests goes to the rooms at `/parties/main/<code>`.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/rooms") {
      if (request.method === "POST") return createRoom(env);
      return new Response("Method Not Allowed", { status: 405 });
    }

    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
