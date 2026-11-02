import { describeEvents } from "@/game/events";

import { GameEvent } from "@/types/GameEvent";

const STATUS_MESSAGE = {
  loading: "Loading word list...",
  ready: "",
  error: "Could not load words. Refresh to retry.",
} as const;

type StatusMessageProps = {
  status: keyof typeof STATUS_MESSAGE;
  events: GameEvent[];
};

export default function StatusMessage({ status, events }: StatusMessageProps) {
  const statusMessage = STATUS_MESSAGE[status];
  const message = statusMessage || describeEvents(events);

  return (
    <div className="relative flex h-8 w-full shrink-0 items-center justify-center">
      {message && (
        <span
          key={message}
          aria-hidden
          className={
            statusMessage
              ? "px-2 text-center font-sans text-base leading-6 font-medium text-foreground"
              : "animate-[notice-pop_0.3s_ease-out] rounded-full bg-foreground px-4 py-1 text-center font-sans text-base leading-6 font-semibold text-background motion-reduce:animate-none"
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
