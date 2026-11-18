"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

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

export default function JoinRoom() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeSlot = Math.min(typed.length, ROOM_CODE_LENGTH - 1);

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
    <form onSubmit={handleJoin} className="flex flex-col gap-3">
      <label
        htmlFor="room-code"
        className="text-sm font-semibold tracking-wide text-muted-foreground"
      >
        JOIN A FRIEND
      </label>

      <div className="relative">
        <div className="flex gap-2" aria-hidden="true">
          {SLOT_INDEXES.map((index) => (
            <div
              key={index}
              className={`flex h-12 flex-1 items-center justify-center rounded-md border-2 text-xl font-semibold ${
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
          aria-describedby="join-message"
          className="absolute inset-0 h-full w-full cursor-text text-base opacity-0"
        />
      </div>

      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={typed.length < ROOM_CODE_LENGTH}
      >
        JOIN
      </Button>

      <p id="join-message" role="alert" className="h-5 text-center text-sm">
        {message}
      </p>
    </form>
  );
}
