import { Player } from "@/types/HexTile";

type GameOverDialogProps = {
  winner: Player;
  resetGame: () => void;
};

/** Modal shown when the game ends, showing the winner and a replay button. */
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
      <div className="flex flex-col items-center gap-4 rounded bg-white p-6 text-stone-900">
        <p
          id="game-over-title"
          className="text-2xl"
        >{`Player ${winner} wins`}</p>
        <button
          autoFocus
          className="bg-red-500 px-4 py-2 text-white"
          onClick={resetGame}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
