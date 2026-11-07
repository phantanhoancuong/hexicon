import { useEffect, useRef } from "react";

/** The size of the clock's drawing area, in `viewBox` units. Used by `TurnClock`. */
export const CLOCK_SIZE = 48;
export const CLOCK_CENTER = CLOCK_SIZE / 2;

/** The radius and thickness of the ring, in `viewBox` units. */
export const RING_RADIUS = 20;
export const RING_STROKE_WIDTH = 4;

const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type DrainingRingProps = {
  durationSeconds: number;
  /** How long the ring stays full before it starts to drain. */
  delayMs: number;
  /** If the ring should be draining. */
  running: boolean;
  /** If little time is left, the ring is drawn more stronger. */
  isLow: boolean;
};

/** The ring of the turn clock draining over the turn. */
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
      cx={CLOCK_CENTER}
      cy={CLOCK_CENTER}
      r={RING_RADIUS}
      fill="none"
      strokeWidth={RING_STROKE_WIDTH}
      strokeDasharray={CIRCUMFERENCE}
      className={isLow ? "stroke-foreground" : "stroke-muted-foreground"}
    />
  );
}
