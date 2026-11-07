"use client";

import Link from "next/link";

import { Button, buttonClass } from "@/components/ui";

import {
  useOnlineRoom,
  type ConnectionStatus,
  type OnlineError,
  type RoomView,
} from "@/hooks/useOnlineRoom";
import { normalizeRoomCode } from "@/online/roomCode";
import { useState } from "react";

/** How long "COPIED" stays on the button, in milliseconds. */
const COPIED_MESSAGE_MS = 2000;

/** Maps internal server error messages to readable messages for the players. */
const ERROR_MESSAGE: Record<OnlineError, string> = {
  "room-not-found": "There is no game room with that code.",
  "room-full": "This game room already has two players.",
  replaced: "You joined this game room from another tab. Use that one.",
  "invalid-message": "Something went wrong. Try refreshing the page.",
};

/**
 * Describes what is happening in the game room.
 *
 * @param status - How the connection to the game room is.
 * @param room - The latest state of the game room, `null` before receiving the processed state.
 * @returns The text to show to the player.
 */
const describeRoom = (
  status: ConnectionStatus,
  room: RoomView | null,
): string => {
  if (status === "reconnecting") return "Connection lost. Reconnecting...";
  if (status !== "joined" || room === null) return "Connecting...";
  if (room.opponent === null) return "Waiting for your friend to join";
  return room.opponent.connected
    ? "Your friend is here"
    : "Your friend disconnected";
};

function Problem({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 pb-12">
      <p role="alert" className="max-w-xs text-center">
        {message}
      </p>
      <Link
        href="/play/online"
        className={buttonClass({
          variant: "secondary",
          size: "lg",
          className: "w-full max-w-xs",
        })}
      >
        BACK
      </Link>
    </div>
  );
}

/** Screen for a online game room. */
export default function OnlineRoom({ code }: { code: string }) {
  const normalized = normalizeRoomCode(code);
  const { status, room, error } = useOnlineRoom(normalized);
  const [copied, setCopied] = useState<boolean>(false);

  if (normalized === null)
    return <Problem message="You've entered an invalid room code." />;
  if (status === "closed" && error !== null)
    return <Problem message={ERROR_MESSAGE[error]} />;

  /** Copies the room code to the clipboard and shows "COPIED" for a moment. */
  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_MESSAGE_MS);
    } catch {}
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 pb-12">
      <section className="flex w-full max-w-xs flex-col items-center gap-3 rounded-md border-2 border-border p-5">
        <span className="text-sm text-muted-foreground">Room code</span>
        <span className="text-4xl font-semibold tracking-[0.18em]">
          {normalized}
        </span>
        <Button variant="secondary" className="text-sm" onClick={handleCopy}>
          {copied ? "COPIED" : "COPY CODE"}
        </Button>
      </section>

      <p role="status" className="text-sm text-muted-foreground">
        {describeRoom(status, room)}
      </p>
    </div>
  );
}
