"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { loadSession, saveSession } from "@/lib/onlineSession";
import { createRoom } from "@/lib/roomApi";
import {
  normalizeRoomCode,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
} from "@/online/roomCode";

const PRIMARY_CLASS =
  "flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-accent font-semibold tracking-wide text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY_CLASS =
  "flex h-12 w-full cursor-pointer items-center justify-center rounded-md border-2 border-border font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-50";

const SLOT_INDEXES = Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => i);

const cleanTyped = (input: string): string =>
  Array.from(input.toUpperCase())
    .filter((char) => ROOM_CODE_ALPHABET.includes(char))
    .join("")
    .slice(0, ROOM_CODE_LENGTH);

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

  const handleJoin = (event: FormEvent) => {
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
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className={PRIMARY_CLASS}
          >
            {creating ? "CREATING..." : "CREATE ROOM"}
          </button>
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
                // Keep the caret at the end so it matches the highlighted slot.
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

          <button
            type="submit"
            disabled={typed.length < ROOM_CODE_LENGTH}
            className={SECONDARY_CLASS}
          >
            JOIN
          </button>
        </form>

        <p id="online-message" role="alert" className="h-5 text-center text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
