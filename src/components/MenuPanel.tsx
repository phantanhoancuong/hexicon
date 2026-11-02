"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import AlternateOption from "@/components/AlternateOption";
import DifficultySelect from "@/components/DifficultySelect";
import FlipOption from "@/components/FlipOption";
import Icon from "@/components/Icon";
import type { Mode } from "@/game/mode";
import { useMounted } from "@/hooks/useMounted";
import { group, robot } from "@/icons";
import { useMode } from "@/lib/settings";

const START_CLASS =
  "flex h-12 w-full items-center justify-center rounded-md bg-accent font-semibold tracking-wide text-accent-foreground";

const MODE_BUTTONS: {
  mode: Mode;
  label: string;
  icon: typeof group;
  options?: ReactNode;
}[] = [
  {
    mode: "local",
    label: "LOCAL",
    icon: group,
    options: (
      <>
        <FlipOption />
        <AlternateOption />
      </>
    ),
  },
  {
    mode: "bot",
    label: "VS BOT",
    icon: robot,
    options: (
      <>
        <DifficultySelect />
        <AlternateOption />
      </>
    ),
  },
];

export default function MenuPanel() {
  const [mode, setMode] = useMode();
  const mounted = useMounted();

  return (
    <div className={`flex w-full flex-col gap-4 ${mounted ? "" : "invisible"}`}>
      <div role="group" aria-label="Game mode" className="flex flex-col gap-3">
        {MODE_BUTTONS.map(({ mode: buttonMode, label, icon, options }) => {
          const selected = buttonMode === mode;
          return (
            <div
              key={buttonMode}
              className={`rounded-md border-2 transition-colors motion-reduce:transition-none ${
                selected ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(buttonMode)}
                className={`flex h-12 w-full items-center gap-2 px-4 font-semibold tracking-wide ${
                  selected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon src={icon} className="size-6" />
                <span className="flex-1 text-left">{label}</span>
                <span
                  aria-hidden="true"
                  className={`size-4 rounded-full border-2 ${
                    selected ? "border-accent bg-accent" : "border-border"
                  }`}
                />
              </button>

              {options && (
                <div
                  inert={!selected}
                  className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
                    selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mx-3 flex flex-col gap-3 border-t-2 border-accent/30 py-3">
                      {options}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link href={`/play/${mode}`} className={START_CLASS}>
        START
      </Link>
    </div>
  );
}
