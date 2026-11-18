"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import AlternateOption from "@/components/menu/AlternateOption";
import AutoFlipSwitch from "@/components/menu/AutoFlipSwitch";
import CreateRoomButton from "@/components/menu/CreateRoomButton";
import DifficultySelect from "@/components/menu/DifficultySelect";
import JoinRoom from "@/components/menu/JoinRoom";

import { buttonClass, Icon } from "@/components/ui";
import { globe, group, robot } from "@/icons";

import type { Mode } from "@/game/mode";

import { useMounted } from "@/hooks/useMounted";

import { useMode } from "@/lib/settings";

const MODE_BUTTONS: {
  mode: Mode;
  label: string;
  icon: typeof group;
  options?: ReactNode;
}[] = [
  { mode: "online", label: "online", icon: globe, options: <JoinRoom /> },
  {
    mode: "local",
    label: "local",
    icon: group,
    options: (
      <>
        <AutoFlipSwitch />
        <AlternateOption mode="local" />
      </>
    ),
  },
  {
    mode: "bot",
    label: "vs bot",
    icon: robot,
    options: (
      <>
        <DifficultySelect />
        <AlternateOption mode="bot" />
      </>
    ),
  },
];

export default function MenuPanel() {
  const [mode, setMode] = useMode();
  const mounted = useMounted();

  return (
    <div className={`flex w-full flex-col gap-6 ${mounted ? "" : "invisible"}`}>
      <div
        role="group"
        aria-label="Game mode"
        className="flex gap-1 rounded-lg bg-foreground/5 p-1"
      >
        {MODE_BUTTONS.map(({ mode: buttonMode, label, icon }) => {
          const selected = buttonMode === mode;
          return (
            <button
              key={buttonMode}
              type="button"
              aria-pressed={selected}
              onClick={() => setMode(buttonMode)}
              className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors motion-reduce:transition-none ${
                selected
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              }`}
            >
              <Icon src={icon} className="size-5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid">
        {MODE_BUTTONS.map(({ mode: buttonMode, options }) => {
          if (!options) return null;
          const selected = buttonMode === mode;
          return (
            <div
              key={buttonMode}
              inert={!selected}
              className={`col-start-1 row-start-1 flex flex-col gap-3 transition-[opacity,visibility] duration-200 motion-reduce:transition-none ${
                selected ? "opacity-100" : "invisible opacity-0"
              }`}
            >
              {options}
            </div>
          );
        })}
      </div>

      <div>
        {mode === "online" ? (
          <CreateRoomButton />
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href={`/play/${mode}`}
              className={buttonClass({ size: "lg", className: "w-full" })}
            >
              START
            </Link>
            <div aria-hidden="true" className="h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
