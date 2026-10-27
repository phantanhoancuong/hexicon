import { useEffect, useRef, useState } from "react";

type UseCountdownOptions = {
  running: boolean;
  durationSeconds: number;
  resetKey: number;
  onExpire: () => void;
};

export const useCountdown = ({
  running,
  durationSeconds,
  resetKey,
  onExpire,
}: UseCountdownOptions): number | null => {
  const [now, setNow] = useState<number>(0);
  const [deadline, setDeadline] = useState<number | null>(null);

  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) {
      setDeadline(null);
      return;
    }

    const startTime = Date.now();
    const nextDeadline = startTime + durationSeconds * 1000;
    setNow(startTime);
    setDeadline(nextDeadline);
  }, [resetKey, running, durationSeconds]);

  useEffect(() => {
    if (deadline === null) return;

    const update = setInterval(() => {
      setNow(Date.now());
    }, 250);

    const expiry = setTimeout(
      () => onExpireRef.current(),
      Math.max(0, deadline - Date.now()),
    );

    return () => {
      clearInterval(update);
      clearTimeout(expiry);
    };
  }, [deadline]);

  return deadline === null
    ? null
    : Math.max(0, Math.ceil((deadline! - now) / 1000));
};
