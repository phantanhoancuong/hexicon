"use client";

import { useId } from "react";

import Badge from "@/components/ui/Badge";

type SegmentedControlProps<T extends string | number> = {
  label: string;
  badge?: string;
  description?: string;
  card?: boolean;
  inline?: boolean;
  disabled?: boolean;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string | number>({
  label,
  badge,
  description,
  card = false,
  inline = false,
  disabled,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const headingId = useId();

  return (
    <div
      className={`flex w-full ${
        inline
          ? "min-h-14 items-center justify-between gap-4 rounded-md border border-border bg-surface px-4"
          : card
            ? "flex-col gap-3 rounded-md bg-foreground/10 p-3"
            : "flex-col gap-1.5"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            id={headingId}
            className={
              inline
                ? "font-semibold"
                : card
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
        className={`flex gap-1 rounded-md bg-foreground/10 p-1 ${
          inline ? "" : "w-full"
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`h-8 ${inline ? "px-3" : "flex-1"} cursor-pointer rounded text-xs font-semibold tracking-wide uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground enabled:hover:bg-foreground/10 enabled:hover:text-foreground"
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
