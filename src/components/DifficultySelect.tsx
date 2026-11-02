"use client";

import SegmentedControl from "@/components/SegmentedControl";
import { DIFFICULTIES } from "@/game/difficulty";
import { useDifficulty } from "@/lib/settings";

const OPTIONS = DIFFICULTIES.map((level) => ({ value: level, label: level }));

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
