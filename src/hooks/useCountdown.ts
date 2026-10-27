import { useEffect, useRef, useState } from "react";

const DISPLAY_INTERVAL_MS = 250;

type UseCountdownOptions = {
  running: boolean;
  durationSeconds: number;
  resetKey: number;
  onExpire: () => void;
};

type Tick = {
  key: number;
  secondsLeft: number;
};

export const useCountdown = ({
  running,
  durationSeconds,
  resetKey,
  onExpire,
}: UseCountdownOptions): number | null => {
  const [tick, setTick] = useState<Tick | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;

    const deadline = Date.now() + durationSeconds * 1000;

    const update = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );

      setTick((prev) =>
        prev?.key === resetKey && prev.secondsLeft === secondsLeft
          ? prev
          : { key: resetKey, secondsLeft },
      );
    };

    const first = setTimeout(update, 0);
    const display = setInterval(update, DISPLAY_INTERVAL_MS);
    const expiry = setTimeout(
      () => onExpireRef.current(),
      Math.max(0, deadline - Date.now()),
    );

    return () => {
      clearTimeout(first);
      clearInterval(display);
      clearTimeout(expiry);
    };
  }, [resetKey, running, durationSeconds]);

  if (!running || tick === null || tick.key !== resetKey) return null;
  return tick.secondsLeft;
};
