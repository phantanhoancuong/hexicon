import { Player } from "@/types/HexCell";

type GameOverDialogProps = {
  winner: Player;
  resetGame: () => void;
};

export default function GameOverDialog({
  winner,
  resetGame,
}: GameOverDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
    >
      <div className="flex flex-col items-center gap-4 rounded bg-white p-6 text-stone-900">
        <p className="text-2xl">{`Player ${winner} wins`}</p>
        <button className="bg-red-500 px-4 py-2 text-white" onClick={resetGame}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
