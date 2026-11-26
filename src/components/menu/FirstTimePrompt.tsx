"use client";

import Link from "next/link";

import { buttonClass, Dialog } from "@/components/ui";

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

  return (
    <Dialog
      labelledBy="first-time-title"
      describedBy="first-time-text"
      onClose={onClose}
      className="gap-5 text-center"
    >
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
    </Dialog>
  );
}
