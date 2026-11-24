"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonClass } from "@/components/ui";

import { useHelpSeen } from "@/lib/tutorialProgress";

type FirstTimePromptProps = {
  startHref: string;
  onClose: () => void;
};

export default function FirstTimePrompt({
  startHref,
  onClose,
}: FirstTimePromptProps) {
  const [, setHelpSeen] = useHelpSeen();

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
      aria-labelledby="first-time-title"
      aria-describedby="first-time-text"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0"
    >
      <div className="flex w-full max-w-xs flex-col gap-5 rounded-xl border border-border bg-surface p-6 text-center text-foreground">
        <div className="flex flex-col gap-2">
          <h2 id="first-time-title" className="text-xl font-semibold">
            New to Hexicon?
          </h2>
          <p id="first-time-text" className="text-sm text-muted-foreground">
            You can learn about the rules of the game through the tutorial
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/how-to-play"
            autoFocus
            className={buttonClass({ size: "lg" })}
          >
            TRY THE TUTORIAL
          </Link>
          <Link
            href={startHref}
            onClick={() => setHelpSeen(true)}
            className={buttonClass({ size: "lg", variant: "secondary" })}
          >
            SKIP
          </Link>
        </div>
      </div>
    </div>
  );
}
