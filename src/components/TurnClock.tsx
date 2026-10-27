type TurnClockProps = {
  secondsLeft: number | null;
};

export default function TurnClock({ secondsLeft }: TurnClockProps) {
  return (
    <div
      className="relative flex size-14 items-center justify-center"
      role="timer"
      aria-label="Time left in turn"
    >
      {secondsLeft ?? ""}
    </div>
  );
}
