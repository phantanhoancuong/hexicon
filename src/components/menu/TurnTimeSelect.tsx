"use client";

import { SegmentedControl } from "@/components/ui";

import { TURN_SECONDS_OPTIONS } from "@/game/constants";

import { TimedMode, useTurnSeconds } from "@/lib/settings";

const OPTIONS = TURN_SECONDS_OPTIONS.map((seconds) => ({
  value: String(seconds),
  label: `${seconds}s`,
}));

type TurnTimeSelectProps = {
  mode: TimedMode;
};

export default function TurnTimeSelect({ mode }: TurnTimeSelectProps) {
  const [turnSeconds, setTurnSeconds] = useTurnSeconds(mode);

  const handleChange = (value: string): void => {
    const next = TURN_SECONDS_OPTIONS.find(
      (seconds) => String(seconds) === value,
    );
    if (next !== undefined) setTurnSeconds(next);
  };

  return (
    <SegmentedControl
      label="Turn time"
      options={OPTIONS}
      value={String(turnSeconds)}
      onChange={handleChange}
    />
  );
}
