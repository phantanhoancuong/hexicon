"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import OnlineGame from "@/components/game/OnlineGame";
import RoomSetting from "@/components/online/RoomSetting";
import Seats from "@/components/online/Seats";
import { Button, buttonClass, SegmentedControl } from "@/components/ui";

import {
  DEFAULT_ALTERNATE,
  TURN_SECONDS,
  TURN_SECONDS_OPTIONS,
} from "@/game/constants";
import { playerName } from "@/game/names";

import {
  useOnlineRoom,
  type ConnectionStatus,
  type OnlineError,
  type RoomView,
} from "@/hooks/useOnlineRoom";

import { normalizeRoomCode } from "@/online/roomCode";

const TURN_TIME_OPTIONS = TURN_SECONDS_OPTIONS.map((seconds) => ({
  value: seconds,
  label: `${seconds}s`,
}));

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
): string | null => {
  if (status === "reconnecting") return "Connection lost. Reconnecting...";
  if (status !== "joined" || room === null) return "Connecting...";

  const { self, opponent } = room;
  if (
    opponent?.connected === true &&
    self.side !== null &&
    self.side === opponent.side
  ) {
    const side = playerName(self.side).toUpperCase();
    return opponent.ready
      ? `Your opponent is ready as ${side}. Pick the other side to be ready.`
      : `You both picked ${side}. Only one of you can be ready as ${side}.`;
  }
  return null;
};

function Problem({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 pb-12">
      <p role="alert" className="max-w-xs text-center">
        {message}
      </p>
      <Link
        href="/"
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
  const router = useRouter();
  const {
    status,
    room,
    game,
    opponentSelection,
    error,
    chooseSide,
    setReady,
    setAlternate,
    setTurnSeconds,
    submit,
    select,
    leave,
  } = useOnlineRoom(normalized);
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

  const handleLeave = (): void => {
    leave();
    router.push("/");
  };

  if (room?.inGame === true && game !== null)
    return (
      <OnlineGame
        game={game}
        room={room}
        opponentSelection={opponentSelection}
        connected={status === "joined"}
        onSubmit={submit}
        onSelectionChange={select}
        onPlayAgain={() => setReady(true)}
        onLeave={handleLeave}
      />
    );

  const { self, opponent, alternate, turnSeconds } = room ?? {
    self: null,
    opponent: null,
    alternate: DEFAULT_ALTERNATE,
    turnSeconds: TURN_SECONDS,
  };
  const canReady =
    self !== null &&
    self.side !== null &&
    !(opponent?.ready === true && opponent.side === self.side);

  return (
    <div className="h-full w-full scrollbar-thin [scrollbar-color:var(--color-border)_transparent] scrollbar-gutter-both overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-xs flex-col items-center justify-center gap-5 pb-12">
        <section className="flex w-full items-center justify-between gap-3 rounded-md bg-foreground/10 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Room code</span>
            <span className="text-2xl font-semibold tracking-[0.18em]">
              {normalized}
            </span>
          </div>
          <Button
            variant="secondary"
            className="px-3 text-sm"
            onClick={handleCopy}
          >
            {copied ? "COPIED" : "COPY"}
          </Button>
        </section>

        {self !== null && (
          <>
            <section
              aria-label="Players"
              className="flex w-full flex-col gap-2"
            >
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground">
                PLAYERS
              </h2>
              <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
                <Seats self={self} opponent={opponent} onChoose={chooseSide} />
              </div>
            </section>

            <section
              aria-label="Room settings"
              className="flex w-full flex-col gap-2"
            >
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground">
                ROOM SETTINGS
              </h2>
              <RoomSetting
                label="Alternate first turn"
                checked={alternate}
                disabled={self.ready}
                onChange={setAlternate}
              />
              <SegmentedControl
                inline
                label="Turn time"
                options={TURN_TIME_OPTIONS}
                value={turnSeconds}
                disabled={self.ready}
                onChange={setTurnSeconds}
              />
            </section>

            <div className="sticky bottom-0 z-10 -my-2 w-full bg-background py-2">
              <Button
                size="lg"
                variant={self.ready ? "secondary" : "primary"}
                className="w-full"
                disabled={!self.ready && !canReady}
                onClick={() => setReady(!self.ready)}
              >
                {self.ready ? "NOT READY" : "READY"}
              </Button>
            </div>
          </>
        )}

        <p
          role="status"
          className="min-h-10 text-center text-sm text-muted-foreground"
        >
          {describeRoom(status, room)}
        </p>

        <button
          type="button"
          onClick={handleLeave}
          className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Leave room
        </button>
      </div>
    </div>
  );
}
