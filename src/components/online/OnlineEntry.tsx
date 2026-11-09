"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

import { createRoom } from "@/lib/online/server";
import { loadSession, saveSession } from "@/lib/online/session";
import {
  normalizeRoomCode,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
} from "@/online/roomCode";

import { Button } from "@/components/ui";

const SLOT_INDEXES = Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => i);

const cleanTyped = (input: string): string =>
  Array.from(input.toUpperCase())
    .filter((char) => ROOM_CODE_ALPHABET.includes(char))
    .join("")
    .slice(0, ROOM_CODE_LENGTH);

/** Screen for starting a game room or joining a friend's. */
export default function OnlineEntry() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const activeSlot = Math.min(typed.length, ROOM_CODE_LENGTH - 1);

  const handleCreate = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const code = await createRoom();
      router.push(`/play/online/${code}`);
    } catch {
      setMessage("Could not reach the game server. Try again.");
      setCreating(false);
    }
  };

  const handleJoin = (event: SubmitEvent) => {
    event.preventDefault();

    const code = normalizeRoomCode(typed);
    if (code === null) {
      setMessage(`A room code has ${ROOM_CODE_LENGTH} letters and numbers.`);
      return;
    }

    const session = loadSession();
    saveSession({
      code,
      token: session?.code === code ? session.token : null,
    });
    router.push(`/play/online/${code}`);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 pb-12">
      <h1 className="font-mono text-3xl font-semibold tracking-widest">
        ONLINE
      </h1>

      <div className="flex w-full max-w-xs flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold tracking-wide">Start a new room</h2>
          <p className="text-sm text-muted-foreground">
            You get a code to share with a friend.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "CREATING..." : "CREATE ROOM"}
          </Button>
        </section>

        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <label htmlFor="room-code" className="font-semibold tracking-wide">
            Join a friend
          </label>

          <div className="relative">
            <div className="flex gap-2" aria-hidden="true">
              {SLOT_INDEXES.map((index) => (
                <div
                  key={index}
                  className={`flex h-14 flex-1 items-center justify-center rounded-md border-2 text-2xl font-semibold ${
                    focused && index === activeSlot
                      ? "border-accent"
                      : message !== null
                        ? "border-accent/60"
                        : "border-border"
                  }`}
                >
                  {typed[index] ?? ""}
                </div>
              ))}
            </div>
            <input
              id="room-code"
              value={typed}
              onChange={(event) => {
                setTyped(cleanTyped(event.target.value));
                setMessage(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSelect={(event) => {
                const end = event.currentTarget.value.length;
                event.currentTarget.setSelectionRange(end, end);
              }}
              maxLength={ROOM_CODE_LENGTH * 2}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Room code"
              aria-invalid={message !== null}
              aria-describedby="online-message"
              className="absolute inset-0 h-full w-full cursor-text text-base opacity-0"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={typed.length < ROOM_CODE_LENGTH}
          >
            JOIN
          </Button>
        </form>

        <p id="online-message" role="alert" className="h-5 text-center text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
