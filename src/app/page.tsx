import Link from "next/link";

import Icon from "@/components/Icon";

import { group, robot } from "@/icons";

const BUTTON_CLASS =
  "flex h-12 w-full items-center justify-center gap-2 rounded-md font-semibold tracking-wide";

export default function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 pb-12">
      <h1 className="font-mono text-4xl font-semibold tracking-widest">
        HEXICON
      </h1>

      <nav className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/play/local"
          className={`${BUTTON_CLASS} bg-accent text-accent-foreground`}
        >
          <Icon src={group} className="size-6" />
          LOCAL, 2 PLAYERS
        </Link>

        <Link
          href="/play/bot"
          className={`${BUTTON_CLASS} border-2 border-border`}
        >
          <Icon src={robot} className="size-6" />
          VS BOT
        </Link>
      </nav>
    </div>
  );
}
