import { useEffect, useRef, useState } from "react";

const DISPLAY_INTERVAL_MS = 250;

type UseCountdownOptions = {
  running: boolean;
  durationSeconds: number;
  startDelayMs: number;
  resetKey: number;
  onExpire: () => void;
};

type Tick = {
  key: number;
  secondsLeft: number;
};

/**
 * Counts down from a duration and calls `onExpire` at zero.
 *
 * The full duration is shown for `startDelayMs` before the countdown begins.
 *
 * @param  options - The countdown settings.
 * @returns Whole seconds left, or `null` when the countdown is not active.
 */
export const useCountdown = ({
  running,
  durationSeconds,
  startDelayMs,
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

    const deadline = Date.now() + startDelayMs + durationSeconds * 1000;

    const update = () => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      const secondsLeft = Math.min(durationSeconds, Math.max(0, remaining));

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
  }, [resetKey, running, durationSeconds, startDelayMs]);

  if (!running || tick === null || tick.key !== resetKey) return null;
  return tick.secondsLeft;
};
