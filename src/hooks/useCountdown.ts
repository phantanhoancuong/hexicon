import { useEffect, useRef, useState } from "react";

type UseCountdownOptions = {
  running: boolean;
  durationSeconds: number;
  resetKey: number;
  onExpire: () => void;
};

type Deadline = {
  at: number;
  key: number;
};

export const useCountdown = ({
  running,
  durationSeconds,
  resetKey,
  onExpire,
}: UseCountdownOptions): number | null => {
  const [now, setNow] = useState<number>(0);
  const [deadline, setDeadline] = useState<Deadline | null>(null);

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
    setDeadline({ at: nextDeadline, key: resetKey });
  }, [resetKey, running, durationSeconds]);

  useEffect(() => {
    if (deadline === null) return;

    const update = setInterval(() => {
      setNow(Date.now());
    }, 250);

    const expiry = setTimeout(
      () => onExpireRef.current(),
      Math.max(0, deadline.at - Date.now()),
    );

    return () => {
      clearInterval(update);
      clearTimeout(expiry);
    };
  }, [deadline]);

  if (deadline === null || deadline.key !== resetKey) return null;
  return Math.max(0, Math.ceil((deadline.at - now) / 1000));
};
