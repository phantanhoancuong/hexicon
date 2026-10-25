import { Player, PLAYER_TAG_CLASS } from "@/types/HexTile";

type GameOverDialogProps = {
  winner: Player;
  resetGame: () => void;
};

/** Modal shown when the game ends, with the winner and a replay button. */
export default function GameOverDialog({
  winner,
  resetGame,
}: GameOverDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
    >
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 text-foreground">
        <p id="game-over-title" className="flex items-center gap-2 text-2xl">
          <span
            className={`rounded-md px-2 font-semibold ${PLAYER_TAG_CLASS[winner]}`}
          >
            {`PLAYER ${winner}`}
          </span>
          <span>wins</span>
        </p>
        <button
          autoFocus
          className="cursor-pointer rounded-md bg-accent px-4 py-2 font-semibold tracking-wide text-accent-foreground"
          onClick={resetGame}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
