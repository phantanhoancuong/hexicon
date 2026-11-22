"use client";

import { useState } from "react";

import Rules from "@/components/tutorial/Rules";
import Tutorial from "@/components/tutorial/Tutorial";
import { SegmentedControl } from "@/components/ui";

type View = "tutorial" | "rules";

const OPTIONS: readonly { value: View; label: string }[] = [
  { value: "tutorial", label: "Tutorial" },
  { value: "rules", label: "Rules" },
];

export default function HowToPlay() {
  const [view, setView] = useState<View>("tutorial");

  return (
    <div className="flex h-full w-full max-w-xl flex-col items-center gap-2">
      <div className="w-full shrink-0">
        <SegmentedControl
          label="How to play"
          options={OPTIONS}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="flex min-h-0 w-full flex-1 justify-center">
        {view === "tutorial" ? (
          <Tutorial onShowRules={() => setView("rules")} />
        ) : (
          <Rules onShowTutorial={() => setView("tutorial")} />
        )}
      </div>
    </div>
  );
}
