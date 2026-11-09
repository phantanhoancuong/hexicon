"use client";

import { useId } from "react";

import Badge from "@/components/ui/Badge";

type SegmentedControlProps<T extends string> = {
  label: string;
  badge?: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  label,
  badge,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const headingId = useId();

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          id={headingId}
          className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {label}
        </span>

        {badge && <Badge>{badge}</Badge>}
      </div>

      <div
        role="group"
        aria-labelledby={headingId}
        className="flex w-full gap-1 rounded-md bg-foreground/10 p-1"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`h-8 flex-1 rounded text-xs font-semibold tracking-wide uppercase ${
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
