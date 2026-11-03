import { playerName } from "@/game/names";

import { Player, PLAYER_TAG_CLASS } from "@/types/HexTile";

type PlayerTagProps = {
  player: Player;
  isActive: boolean;
  wins: number;
  /** Optional player the bot controls. */
  botPlayer?: Player;
};

/** A player's name and win count. */
export default function PlayerTag({
  player,
  wins,
  isActive,
  botPlayer,
}: PlayerTagProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex h-12 flex-col items-center justify-center">
        <span
          className={`text-lg font-semibold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}
        >
          {playerName(player, botPlayer)}
        </span>
        <span className="text-sm text-muted-foreground">
          {`${wins} ${wins === 1 ? "win" : "wins"}`}
        </span>
      </div>
      <span
        aria-hidden
        className={`h-0.75 w-full rounded-full transition-colors ${isActive ? PLAYER_TAG_CLASS[player] : "bg-border"}`}
      />
    </div>
  );
}
