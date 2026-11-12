"use client";

import { type ReactNode, useId } from "react";

type SliderProps = {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  leading?: ReactNode;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
};

export default function Slider({
  label,
  description,
  value,
  min,
  max,
  step,
  format,
  leading,
  onChange,
  onCommit,
}: SliderProps) {
  const labelId = useId();

  const notches = Math.round((max - min) / step);
  const index = Math.min(
    notches,
    Math.max(0, Math.round((value - min) / step)),
  );
  const snapped = min + index * step;
  const position = (i: number): string => `${(i / notches) * 100}%`;

  return (
    <div className="flex w-full flex-col gap-3 rounded-md bg-foreground/10 p-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span id={labelId} className="text-sm font-semibold tracking-wide">
            {label}
          </span>
          <span
            aria-hidden="true"
            className="text-sm font-semibold tabular-nums"
          >
            {format(snapped)}
          </span>
        </div>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {leading}
        <div className="relative h-8 flex-1">
          <input
            type="range"
            aria-labelledby={labelId}
            aria-valuetext={format(snapped)}
            min={min}
            max={max}
            step={step}
            value={snapped}
            onChange={(event) => onChange(Number(event.target.value))}
            onPointerUp={(event) =>
              onCommit?.(Number(event.currentTarget.value))
            }
            onKeyUp={(event) => onCommit?.(Number(event.currentTarget.value))}
            className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 [&::-moz-range-thumb]:size-5 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2.5 top-1/2 h-2 -translate-y-1/2 rounded-full bg-foreground/20"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-150 motion-reduce:transition-none"
              style={{ width: position(index) }}
            />
            {Array.from({ length: notches + 1 }, (_, i) => (
              <span
                key={i}
                className={`absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  i <= index ? "bg-accent-foreground/70" : "bg-foreground/40"
                }`}
                style={{ left: position(i) }}
              />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2.5 top-1/2"
          >
            <span
              className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow-sm transition-[left] duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent motion-reduce:transition-none"
              style={{ left: position(index) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
