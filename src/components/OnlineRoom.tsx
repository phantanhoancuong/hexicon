"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  ConnectionStatus,
  OnlineError,
  RoomView,
} from "@/hooks/useOnlineRoom";
import { useOnlineRoom } from "@/hooks/useOnlineRoom";
import { normalizeRoomCode } from "@/online/roomCode";

const ERROR_MESSAGES: Record<OnlineError, string> = {
  "room-not-found": "There is no room with that code.",
  "room-full": "This room already has two players.",
  replaced: "You joined this room from another tab. Use that one.",
  "invalid-message": "Something went wrong. Try refreshing the page.",
};

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
        className="flex h-12 w-full max-w-xs items-center justify-center rounded-md border-2 border-border font-semibold tracking-wide"
      >
        BACK
      </Link>
    </div>
  );
}

export default function OnlineRoom({ code }: { code: string }) {
  const normalized = normalizeRoomCode(code);
  const { status, room, error } = useOnlineRoom(normalized);
  const [copied, setCopied] = useState(false);

  if (normalized === null)
    return <Problem message="That is not a room code." />;
  if (status === "closed" && error !== null) {
    return <Problem message={ERROR_MESSAGES[error]} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 pb-12">
      <section className="flex w-full max-w-xs flex-col items-center gap-3 rounded-md border-2 border-border p-5">
        <span className="text-sm text-muted-foreground">Room code</span>
        <span className="text-4xl font-semibold tracking-[0.18em]">
          {normalized}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-10 items-center justify-center rounded-md border-2 border-border px-4 text-sm font-semibold tracking-wide"
        >
          {copied ? "COPIED" : "COPY CODE"}
        </button>
      </section>

      <p role="status" className="text-sm text-muted-foreground">
        {describeRoom(status, room)}
      </p>
    </div>
  );
}
