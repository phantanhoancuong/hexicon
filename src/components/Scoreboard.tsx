import { PLAYERS } from "@/game/constants";

import { PLAYER_TAG_CLASS } from "@/types/HexCell";

import { Player } from "@/types/HexCell";

type ScoreboardProps = {
  wins: Record<Player, number>;
  currentPlayer: Player;
  turn: number;
  word: string;
};

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
              className={`flex flex-col items-center px-3 ${
                player === currentPlayer
                  ? PLAYER_TAG_CLASS[player]
                  : "bg-transparent text-stone-500"
              }`}
            >
              <span>{`PLAYER ${player}`}</span>
              <span className="text-sm">{`${count} ${count === 1 ? "win" : "wins"}`}</span>
            </div>
          );
        })}
      </div>
      <div className="flex h-8 w-full items-center justify-center truncate text-xl">
        {`Turn ${turn}`}
      </div>
      <div className="flex h-8 w-full items-center justify-center truncate text-xl">
        {word}
      </div>
    </div>
  );
}
