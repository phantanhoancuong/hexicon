import Link from "next/link";

import Game from "@/components/Game";
import Icon from "@/components/Icon";
import { crown } from "@/icons";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex h-14 w-full items-center border-b border-stone-200 px-4 sm:h-16 sm:px-8 dark:border-stone-800">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Hexicon home"
        >
          <Icon className="h-[1.75em] w-[1.75em]" src={crown} alt="" />
          <span className="text-lg leading-none font-semibold tracking-wide sm:text-xl">
            HEXICON
          </span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-2 py-4 sm:px-8 sm:py-10">
        <Game />
      </main>
    </div>
  );
}
