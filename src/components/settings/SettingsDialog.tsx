"use client";

import { useRef } from "react";

import ColorPreview from "@/components/settings/ColorPreview";
import {
  Button,
  Dialog,
  Icon,
  SegmentedControl,
  Slider,
  Toggle,
} from "@/components/ui";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import { close, volumeHigh, volumeLow, volumeMuted } from "@/icons";
import { useColorBlind, useVolume } from "@/lib/settings";
import { playSound } from "@/lib/sounds";

/** The volume levels the slider stops on. */
const VOLUME_STEP = 25;

const FALLBACK_VOLUME = 50;

const THEMES = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type SettingsDialogProps = {
  onClose: () => void;
};

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [volume, setVolume] = useVolume();
  const { theme, setTheme } = useThemeTransition();
  const [colorBlind, setColorBlind] = useColorBlind();
  const lastVolume = useRef(volume > 0 ? volume : FALLBACK_VOLUME);

  const handleVolumeChange = (next: number): void => {
    if (next > 0) lastVolume.current = next;
    setVolume(next);
  };

  const handleMuteToggle = (): void => {
    if (volume > 0) {
      lastVolume.current = volume;
      setVolume(0);
    } else {
      setVolume(lastVolume.current);
      playSound("select", 0, lastVolume.current / 100);
    }
  };

  const muted = volume === 0;
  const currentTheme =
    THEMES.find(({ value }) => value === theme)?.value ?? "system";

  return (
    <Dialog
      labelledBy="settings-title"
      onClose={onClose}
      wide
      className="gap-4"
    >
      {(closeDialog) => (
        <>
          <div className="flex items-center justify-between">
            <h2 id="settings-title" className="text-lg font-semibold">
              Settings
            </h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close settings"
              className="-mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <Icon src={close} className="size-6" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <Slider
              label="VOLUME"
              value={volume}
              min={0}
              max={100}
              step={VOLUME_STEP}
              format={(value) => (value === 0 ? "OFF" : `${value}%`)}
              leading={
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  aria-pressed={muted}
                  aria-label="Mute"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-foreground/10"
                >
                  <Icon
                    src={
                      muted
                        ? volumeMuted
                        : volume <= 50
                          ? volumeLow
                          : volumeHigh
                    }
                    className="size-6"
                  />
                </button>
              }
              onChange={handleVolumeChange}
              onCommit={(value) => playSound("select", 0, value / 100)}
            />
            <SegmentedControl
              card
              label="THEME"
              options={THEMES}
              value={currentTheme}
              onChange={setTheme}
            />
            <Toggle
              label="COLOR-BLIND MODE"
              description="Changes the tile colors to be easier to tell apart for color blind people."
              checked={colorBlind}
              onChange={setColorBlind}
            />
            <ColorPreview />
          </div>
          <Button
            variant="secondary"
            className="w-full font-mono text-sm"
            onClick={closeDialog}
          >
            CLOSE
          </Button>
        </>
      )}
    </Dialog>
  );
}
