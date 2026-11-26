"use client";

import Link from "next/link";

import { Button, buttonClass, Dialog } from "@/components/ui";

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

  return (
    <Dialog
      labelledBy="tutorial-complete-title"
      describedBy="tutorial-complete-text"
      onClose={onClose}
      className="gap-5 text-center"
    >
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
    </Dialog>
  );
}
