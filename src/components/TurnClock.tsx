const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type TurnClockProps = {
  durationSeconds: number;
  secondsLeft: number | null;
  resetKey: number;
};

export default function TurnClock({
  durationSeconds,
  secondsLeft,
  resetKey,
}: TurnClockProps) {
  const fraction =
    secondsLeft === null ? 1 : Math.max(0, secondsLeft - 1) / durationSeconds;
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
        <circle
          key={resetKey}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${
            isLow ? "stroke-foreground" : "stroke-muted-foreground"
          }`}
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
