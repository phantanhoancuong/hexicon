"use client";

type RoomSettingProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export default function RoomSetting({
  label,
  checked,
  disabled,
  onChange,
}: RoomSettingProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 rounded-md border border-border bg-surface px-4">
      <span className="font-semibold">{label}</span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="flex min-h-11 cursor-pointer items-center gap-2.5 text-xs font-bold tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden="true">{checked ? "ON" : "OFF"}</span>
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
    </div>
  );
}
