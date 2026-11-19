import { describeEvents } from "@/game/events";
import { Perspective } from "@/game/names";

import { COACH_CLASS, NOTICE_CLASS } from "@/lib/noticeStyles";

import { GameEvent } from "@/types/GameEvent";

const STATUS_MESSAGE = {
  loading: "Loading word list...",
  ready: "",
  error: "Could not load words. Refresh to retry.",
} as const;

type StatusMessageProps = {
  status: keyof typeof STATUS_MESSAGE;
  events: GameEvent[];
  notice?: string;
  perspective?: Perspective;
};

export default function StatusMessage({
  status,
  events,
  notice,
  perspective,
}: StatusMessageProps) {
  const statusMessage = STATUS_MESSAGE[status];
  const message =
    statusMessage || notice || describeEvents(events, perspective);

  return (
    <div className="relative flex h-8 w-full shrink-0 items-center justify-center">
      {message && (
        <span
          key={message}
          aria-hidden
          className={
            statusMessage
              ? "px-2 text-center font-sans text-base leading-6 font-medium text-foreground"
              : `${message === notice ? COACH_CLASS : NOTICE_CLASS} px-4 py-1`
          }
        >
          {message}
        </span>
      )}

      <p role="status" className="sr-only">
        {message}
      </p>
    </div>
  );
}
