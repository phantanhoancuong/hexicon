"use client";

import { useEffect, useRef } from "react";

type FlipPromptProps = {
  onChoose: (flip: boolean) => void;
};

/** One time dialog that asks local players if they want the screen to flip automatically. */
export default function FlipPrompt({ onChoose }: FlipPromptProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  });

  return (
    <dialog
      ref={dialogRef}
      onCancel={() => onChoose(false)}
      aria-labelledby="flip-prompt-title"
      className="m-auto w-[min(90vw,24rem)] rounded-md border border-border bg-background p-6 font-sans text-foreground shadow-md backdrop:bg-black/50"
    >
      <h2 id="flip-prompt-title" className="text-lg font-semibold">
        Auto flip the screen each turn?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {`Turn on AUTO FLIP to flip the screen whenever a turn passes so you don't have to pass the device around.`}
      </p>
      <div className="mt-5 flex gap-3 font-mono text-sm font-semibold tracking-wide">
        <button
          className="h-10 flex-1 cursor-pointer rounded-md border-2 border-border"
          onClick={() => onChoose(false)}
        >
          {`DON'T FLIP`}
        </button>
        <button
          className="h-10 flex-1 cursor-pointer rounded-md bg-accent text-accent-foreground"
          onClick={() => onChoose(true)}
        >
          FLIP
        </button>
      </div>
    </dialog>
  );
}
