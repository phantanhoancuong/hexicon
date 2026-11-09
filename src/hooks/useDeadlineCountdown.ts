import { useEffect, useState } from "react";

const DISPLAY_INTERVAL_MS = 250;

type Tick = {
  deadline: number;
  secondsLeft: number;
};

export const useDeadlineCountdown = (
  deadline: number | null,
  durationSeconds: number,
): number | null => {
  const [tick, setTick] = useState<Tick | null>(null);

  useEffect(() => {
    if (deadline === null) return;

    const update = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      const secondsLeft = Math.min(durationSeconds, Math.max(0, remaining));

      setTick((prev) =>
        prev?.deadline === deadline && prev.secondsLeft === secondsLeft
          ? prev
          : { deadline, secondsLeft },
      );
      if (secondsLeft === 0) clearInterval(display);
    };

    const first = setTimeout(update, 0);
    const display = setInterval(update, DISPLAY_INTERVAL_MS);

    return () => {
      clearTimeout(first);
      clearInterval(display);
    };
  }, [deadline, durationSeconds]);

  if (deadline === null || tick === null || tick.deadline !== deadline)
    return null;
  return tick.secondsLeft;
};
