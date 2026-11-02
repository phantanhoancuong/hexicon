"use client";

import Badge from "@/components/Badge";

type ToggleProps = {
  label: string;
  badge?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({
  label,
  badge,
  description,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md bg-foreground/10 p-3 text-left"
    >
      <span className="flex flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">{label}</span>
          {badge && <Badge>{badge}</Badge>}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </span>

      <span
        aria-hidden="true"
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
          checked ? "bg-accent" : "bg-foreground/30"
        }`}
      >
        <span
          className={`size-5 rounded-full bg-background transition-transform motion-reduce:transition-none ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
