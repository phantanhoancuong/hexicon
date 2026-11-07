"use client";

import { SegmentedControl } from "@/components/ui";

import { DIFFICULTIES } from "@/game/difficulty";

import { useDifficulty } from "@/lib/settings";

/** Creates a choice for each difficulty level. */
const OPTIONS = DIFFICULTIES.map((level) => ({ value: level, label: level }));

/** Menu control for picking the bot's difficulty. */
export default function DifficultySelect() {
  const [difficulty, setDifficulty] = useDifficulty();

  return (
    <SegmentedControl
      label="Bot difficulty"
      options={OPTIONS}
      value={difficulty}
      onChange={setDifficulty}
    />
  );
}
