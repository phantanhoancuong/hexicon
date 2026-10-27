import PlayerTag from "@/components/PlayerTag";
import TurnClock from "@/components/TurnClock";

import { TURN_SECONDS } from "@/game/constants";
import { Player } from "@/types/HexTile";

type ScoreboardProps = {
  wins: Record<Player, number>;
  currentPlayer: Player;
  turn: number;
  secondsLeft: number | null;
};

/** Shows each player's tag and win count, the turn number and the current word. */
export default function Scoreboard({
  wins,
  currentPlayer,
  turn,
  secondsLeft,
}: ScoreboardProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PlayerTag player={1} wins={wins[1]} isActive={currentPlayer === 1} />
        <TurnClock
          durationSeconds={TURN_SECONDS}
          secondsLeft={secondsLeft}
          resetKey={turn}
        />
        <PlayerTag player={2} wins={wins[2]} isActive={currentPlayer === 2} />
      </div>
      <div className="flex h-5 items-center justify-center text-sm text-muted-foreground">
        {`Turn ${turn}`}
      </div>
    </div>
  );
}
