"use client";

import { useId } from "react";

import Badge from "@/components/ui/Badge";

type SegmentedControlProps<T extends string> = {
  label: string;
  badge?: string;
  description?: string;
  card?: boolean;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  label,
  badge,
  description,
  card = false,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const headingId = useId();

  return (
    <div
      className={`flex w-full flex-col ${
        card ? "gap-3 rounded-md bg-foreground/10 p-3" : "gap-1.5"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            id={headingId}
            className={
              card
                ? "text-sm font-semibold tracking-wide"
                : "text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            }
          >
            {label}
          </span>

          {badge && <Badge>{badge}</Badge>}
        </div>

        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
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
