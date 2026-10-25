import { PLAYERS } from "@/game/constants";

import { PLAYER_TAG_CLASS, Player } from "@/types/HexTile";

type ScoreboardProps = {
  wins: Record<Player, number>;
  currentPlayer: Player;
  turn: number;
  word: string;
};

/** Shows each player's tag and win count, the turn number and the current word. */
export default function Scoreboard({
  wins,
  currentPlayer,
  turn,
  word,
}: ScoreboardProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-start justify-between text-xl">
        {PLAYERS.map((player) => {
          const count = wins[player];
          return (
            <div
              key={player}
              className={`flex flex-col items-center rounded-md px-3 font-semibold tracking-wide transition-colors ${
                player === currentPlayer
                  ? PLAYER_TAG_CLASS[player]
                  : "bg-transparent text-muted-foreground"
              }`}
            >
              <span>{`PLAYER ${player}`}</span>
              <span className="text-sm font-normal">{`${count} ${count === 1 ? "win" : "wins"}`}</span>
            </div>
          );
        })}
      </div>
      <div className="flex h-8 w-full items-center justify-center text-xl text-muted-foreground">
        {`Turn ${turn}`}
      </div>
      <div className="flex h-8 w-full items-center justify-center font-mono text-xl font-semibold tracking-widest">
        <span className="truncate">{word}</span>
      </div>
    </div>
  );
}
