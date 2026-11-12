"use client";

import { useEffect, useRef } from "react";

import { Button, Icon, Slider } from "@/components/ui";
import { volumeHigh, volumeLow, volumeMuted } from "@/icons";

import { useVolume } from "@/lib/settings";
import { playSound } from "@/lib/sounds";

const VOLUME_STEP = 25;

const FALLBACK_VOLUME = 50;

type SettingsDialogProps = {
  onClose: () => void;
};

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [volume, setVolume] = useVolume();
  const lastVolume = useRef(volume > 0 ? volume : FALLBACK_VOLUME);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  });

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

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="settings-title"
      className="m-auto w-[min(90vw,24rem)] rounded-md border border-border bg-background p-6 font-sans text-foreground shadow-md backdrop:bg-black/50"
    >
      <h2 id="settings-title" className="text-lg font-semibold">
        Settings
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <Slider
          label="VOLUME"
          description="How loud the game sounds are."
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
                  muted ? volumeMuted : volume <= 50 ? volumeLow : volumeHigh
                }
                className="size-6"
              />
            </button>
          }
          onChange={handleVolumeChange}
          onCommit={(value) => playSound("select", 0, value / 100)}
        />
      </div>
      <Button
        autoFocus
        variant="secondary"
        className="mt-5 w-full font-mono text-sm"
        onClick={onClose}
      >
        CLOSE
      </Button>
    </dialog>
  );
}
