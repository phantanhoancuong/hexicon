import type { ReactNode } from "react";

import { Dialog } from "@/components/ui";

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
    <Dialog labelledBy="game-over-title" className="items-center gap-4">
      <p id="game-over-title" className="flex items-center gap-2 text-2xl">
        <span
          className={`rounded-md px-2 font-semibold ${PLAYER_TAG_CLASS[winner]}`}
        >
          {playerName(winner, perspective).toUpperCase()}
        </span>
        <span>{isYou(winner, perspective) ? "win" : "wins"}</span>
      </p>
      {children}
    </Dialog>
  );
}
