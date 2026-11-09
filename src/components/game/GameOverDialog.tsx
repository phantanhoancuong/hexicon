import type { ReactNode } from "react";

import { isYou, Perspective, playerName } from "@/game/names";

import { PLAYER_TAG_CLASS } from "@/lib/tileStyles";

import { Player } from "@/types/HexTile";

type GameOverDialogProps = {
  winner: Player;
  perspective?: Perspective;
  children: ReactNode;
};

/** Modal shown when the game ends, with the winner and a replay button. */
export default function GameOverDialog({
  winner,
  perspective,
  children,
}: GameOverDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
    >
      <div className="flex w-80 max-w-[calc(100vw-2rem)] flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 text-foreground">
        <p id="game-over-title" className="flex items-center gap-2 text-2xl">
          <span
            className={`rounded-md px-2 font-semibold ${PLAYER_TAG_CLASS[winner]}`}
          >
            {playerName(winner, perspective).toUpperCase()}
          </span>
          <span>{isYou(winner, perspective) ? "win" : "wins"}</span>
        </p>
        {children}
      </div>
    </div>
  );
}
