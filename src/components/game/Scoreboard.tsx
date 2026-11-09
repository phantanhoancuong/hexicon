import PlayerTag from "@/components/game/PlayerTag";
import TurnClock from "@/components/game/TurnClock";

import { TURN_PAUSE_MS, TURN_SECONDS } from "@/game/constants";
import { Perspective } from "@/game/names";

import { Player } from "@/types/HexTile";

type ScoreboardProps = {
  wins: Record<Player, number>;
  currentPlayer: Player;
  turn: number;
  secondsLeft: number | null;
  perspective?: Perspective;
};

/** Shows each player's tag and win count, the turn number and the current word. */
export default function Scoreboard({
  wins,
  currentPlayer,
  turn,
  secondsLeft,
  perspective,
}: ScoreboardProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PlayerTag
          player={1}
          wins={wins[1]}
          isActive={currentPlayer === 1}
          perspective={perspective}
        />
        <TurnClock
          durationSeconds={TURN_SECONDS}
          delayMs={TURN_PAUSE_MS}
          secondsLeft={secondsLeft}
          resetKey={turn}
        />
        <PlayerTag
          player={2}
          wins={wins[2]}
          isActive={currentPlayer === 2}
          perspective={perspective}
        />
      </div>
      <div className="flex h-5 items-center justify-center text-sm text-muted-foreground">
        {`Turn ${turn}`}
      </div>
    </div>
  );
}
