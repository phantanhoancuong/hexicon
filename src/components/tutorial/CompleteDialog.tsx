"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonClass } from "@/components/ui";

import { useMode } from "@/lib/settings";

type CompleteDialogProps = {
  onShowRules: () => void;
  onClose: () => void;
};

export default function CompleteDialog({
  onShowRules,
  onClose,
}: CompleteDialogProps) {
  const [, setMode] = useMode();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-complete-title"
      aria-describedby="tutorial-complete-text"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-5 transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0"
    >
      <div className="flex w-full max-w-xs flex-col gap-5 rounded-xl border border-border bg-surface p-6 text-center text-foreground">
        <div className="flex flex-col gap-2">
          <h2 id="tutorial-complete-title" className="text-2xl font-semibold">
            Tutorial complete
          </h2>
          <p
            id="tutorial-complete-text"
            className="text-sm leading-6 text-muted-foreground"
          >
            You are ready for a real game!
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/"
            autoFocus
            onClick={() => setMode("bot")}
            className={buttonClass({ size: "lg" })}
          >
            PLAY VS BOT
          </Link>
          <Button variant="secondary" size="lg" onClick={onShowRules}>
            VIEW RULES
          </Button>
        </div>
      </div>
    </div>
  );
}
