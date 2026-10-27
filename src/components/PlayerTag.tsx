import {
  Player,
  PLAYER_TAG_CLASS,
  PLAYER_TAG_IDLE_CLASS,
} from "@/types/HexTile";

type PlayerTagProps = {
  player: Player;
  isActive: boolean;
  wins: number;
};

export default function PlayerTag({ player, wins, isActive }: PlayerTagProps) {
  return (
    <div
      className={`flex w-full flex-col items-center rounded-md border-2 px-3 font-semibold tracking-wide transition-colors ${isActive ? PLAYER_TAG_CLASS[player] : PLAYER_TAG_IDLE_CLASS[player]}`}
    >
      <span className="text-lg">{`PLAYER ${player}`}</span>
      <span className="text-sm font-normal">{`${wins} ${wins === 1 ? "win" : "wins"}`}</span>
    </div>
  );
}
