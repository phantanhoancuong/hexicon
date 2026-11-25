"use client";

import { SegmentedControl } from "@/components/ui";

import { TURN_SECONDS_OPTIONS } from "@/game/constants";

import { TimedMode, useTurnSeconds } from "@/lib/settings";

const OPTIONS = TURN_SECONDS_OPTIONS.map((seconds) => ({
  value: seconds,
  label: `${seconds}s`,
}));

type TurnTimeSelectProps = {
  mode: TimedMode;
};

export default function TurnTimeSelect({ mode }: TurnTimeSelectProps) {
  const [turnSeconds, setTurnSeconds] = useTurnSeconds(mode);

  return (
    <SegmentedControl
      label="Turn time"
      options={OPTIONS}
      value={turnSeconds}
      onChange={setTurnSeconds}
    />
  );
}
