import { useEffect, useRef } from "react";

export const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type DrainingRingProps = {
  durationSeconds: number;
  delayMs: number;
  running: boolean;
  isLow: boolean;
};

export default function DrainingRing({
  durationSeconds,
  delayMs,
  running,
  isLow,
}: DrainingRingProps) {
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !running) return;

    const animation = ring.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: CIRCUMFERENCE }],
      {
        duration: durationSeconds * 1000,
        delay: delayMs,
        easing: "linear",
        fill: "both",
      },
    );

    return () => animation.cancel();
  }, [running, durationSeconds, delayMs]);

  return (
    <circle
      ref={ringRef}
      cx="24"
      cy="24"
      r={RADIUS}
      fill="none"
      strokeWidth="4"
      strokeDasharray={CIRCUMFERENCE}
      className={isLow ? "stroke-foreground" : "stroke-muted-foreground"}
    />
  );
}
