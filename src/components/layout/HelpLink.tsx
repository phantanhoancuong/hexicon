"use client";

import Link from "next/link";

import { Icon } from "@/components/ui";
import { help } from "@/icons";

import { useMounted } from "@/hooks/useMounted";

import { useTutorialDone } from "@/lib/tutorialProgress";

export default function HelpLink() {
  const mounted = useMounted();
  const [tutorialDone] = useTutorialDone();

  return (
    <Link
      href="/how-to-play"
      aria-label="How to play"
      className="relative flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:size-8 lg:size-9"
    >
      <Icon src={help} className="size-7 sm:size-8 lg:size-9" />
      {mounted && !tutorialDone && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background"
        />
      )}
    </Link>
  );
}
