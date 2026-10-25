import Link from "next/link";

import Game from "@/components/Game";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeProvider";

import { crown } from "@/icons";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-mono text-foreground">
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border px-4 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-accent"
          aria-label="Hexicon home"
        >
          <Icon className="h-[1.75em] w-[1.75em]" src={crown} alt="" />
          <span className="text-lg leading-none font-semibold tracking-wide text-foreground sm:text-xl">
            HEXICON
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 justify-center px-2 py-2 sm:px-8 sm:py-4">
        <Game />
      </main>
    </div>
  );
}
