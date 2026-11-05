import type { Connection, WSMessage } from "partyserver";
import { getServerByName, routePartykitRequest, Server } from "partyserver";

import { parseClientMessage } from "@/online/parseClientMessage";
import { generateRoomCode } from "@/online/roomCode";

import type { PlayerInfo, ServerMessage } from "@/types/Online";

type Env = { Main: DurableObjectNamespace<Room> };

const MAX_PLAYERS = 2;

const TOKENS_KEY = "tokens";

const CREATED_KEY = "created";

const CLAIM_PATH = "/claim";

const EMPTY_ROOM_SECONDS = 600;

const MAX_CREATE_ATTEMPTS = 5;

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

type ConnectionState = { token: string };

const send = (connection: Connection, message: ServerMessage) =>
  connection.send(JSON.stringify(message));

const tokenOf = (connection: Connection): string | null => {
  const state = connection.state as Partial<ConnectionState> | null;
  return state?.token ?? null;
};

export class Room extends Server<Env> {
  static options = { hibernate: true };

  async onRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method !== "POST" || pathname !== CLAIM_PATH)
      return new Response("Not Found", { status: 404 });

    if (await this.isCreated())
      return new Response("Room already exists", { status: 409 });

    await this.ctx.storage.put(CREATED_KEY, true);
    await this.scheduleCleanup();
    return new Response("Created");
  }

  async onMessage(connection: Connection, message: WSMessage) {
    const parsed =
      typeof message === "string" ? parseClientMessage(message) : null;
    if (!parsed) {
      send(connection, { type: "error", reason: "invalid-message" });
      return;
    }

    if (parsed.type === "join") await this.join(connection, parsed.token);
  }

  async onClose(connection: Connection) {
    await this.broadcastRoom(connection);

    const othersOpen = Array.from(this.getConnections()).some(
      (other) => other.id !== connection.id,
    );
    if (!othersOpen && (await this.isCreated())) await this.scheduleCleanup();
  }

  async onAlarm() {
    if (Array.from(this.getConnections()).length > 0) return;
    await this.ctx.storage.deleteAll();
  }

  private async join(connection: Connection, token: string | null) {
    if (tokenOf(connection) !== null) {
      send(connection, { type: "error", reason: "invalid-message" });
      return;
    }

    if (!(await this.isCreated())) {
      send(connection, { type: "error", reason: "room-not-found" });
      return;
    }

    const tokens = await this.getTokens();
    let own = token !== null && tokens.includes(token) ? token : null;

    if (own === null) {
      if (tokens.length >= MAX_PLAYERS) {
        send(connection, { type: "error", reason: "room-full" });
        return;
      }
      own = crypto.randomUUID();
      tokens.push(own);
      await this.ctx.storage.put(TOKENS_KEY, tokens);
    }

    for (const other of this.getConnections()) {
      if (other.id !== connection.id && tokenOf(other) === own)
        other.close(4000, "replaced");
    }

    await this.ctx.storage.deleteAlarm();

    connection.setState({ token: own } satisfies ConnectionState);
    send(connection, { type: "welcome", token: own });
    await this.broadcastRoom();
  }

  private async broadcastRoom(closing?: Connection) {
    const tokens = await this.getTokens();
    const connected = new Set<string>();

    for (const connection of this.getConnections()) {
      if (connection.id === closing?.id) continue;
      const token = tokenOf(connection);
      if (token !== null) connected.add(token);
    }

    for (const connection of this.getConnections()) {
      if (connection.id === closing?.id) continue;
      const own = tokenOf(connection);
      if (own === null) continue;

      const otherToken = tokens.find((token) => token !== own);
      const opponent: PlayerInfo | null =
        otherToken === undefined
          ? null
          : { connected: connected.has(otherToken) };

      send(connection, { type: "room", self: { connected: true }, opponent });
    }
  }

  private async scheduleCleanup() {
    await this.ctx.storage.setAlarm(Date.now() + EMPTY_ROOM_SECONDS * 1000);
  }

  private async isCreated(): Promise<boolean> {
    return (await this.ctx.storage.get<boolean>(CREATED_KEY)) === true;
  }

  private async getTokens(): Promise<string[]> {
    return (await this.ctx.storage.get<string[]>(TOKENS_KEY)) ?? [];
  }
}

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
