import DrainingRing, {
  CLOCK_CENTER,
  CLOCK_SIZE,
  RING_RADIUS,
  RING_STROKE_WIDTH,
} from "@/components/game/DrainingRing";

/** The clock is drawn in a more noticeable way when less than this share of the full time is left. */
const LOW_TIME_RATIO = 0.1;

type TurnClockProps = {
  durationSeconds: number;
  /** Pause before the clock starts. */
  delayMs: number;
  /** Whole seconds left, or `null` when the clock is not running. */
  secondsLeft: number | null;
  /** A value that changes every turn, so the ring knows when to start over. */
  resetKey: number;
};

/** A ring and a number that count down the current turn. */
export default function TurnClock({
  durationSeconds,
  delayMs,
  secondsLeft,
  resetKey,
}: TurnClockProps) {
  const isLow =
    secondsLeft !== null && secondsLeft / durationSeconds < LOW_TIME_RATIO;

  return (
    <div
      className="relative flex size-14 items-center justify-center"
      role="timer"
      aria-label="Time left in turn"
    >
      <svg
        viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE_WIDTH}
          className="stroke-border"
        />
        <DrainingRing
          key={resetKey}
          durationSeconds={durationSeconds}
          delayMs={delayMs}
          running={secondsLeft !== null}
          secondsLeft={secondsLeft}
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
