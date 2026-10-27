import DrainingRing, { RADIUS } from "@/components/DrainingRing";

type TurnClockProps = {
  durationSeconds: number;
  delayMs: number;
  secondsLeft: number | null;
  resetKey: number;
};

export default function TurnClock({
  durationSeconds,
  delayMs,
  secondsLeft,
  resetKey,
}: TurnClockProps) {
  const isLow = secondsLeft !== null && secondsLeft / durationSeconds < 0.1;

  return (
    <div
      className="relative flex size-14 items-center justify-center"
      role="timer"
      aria-label="Time left in turn"
    >
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-border"
        />
        <DrainingRing
          key={resetKey}
          durationSeconds={durationSeconds}
          delayMs={delayMs}
          running={secondsLeft !== null}
          isLow={isLow}
        />
      </svg>
      <span
        className={`relative font-mono text-lg tabular-nums ${
          isLow ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {secondsLeft ?? ""}
      </span>
    </div>
  );
}
