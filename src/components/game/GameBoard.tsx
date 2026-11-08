import type { ComponentProps } from "react";

import HexGrid from "@/components/game/HexGrid";
import Scoreboard from "@/components/game/Scoreboard";
import StatusMessage from "@/components/game/StatusMessage";
import WordDisplay from "@/components/game/WordDisplay";
import { Button } from "@/components/ui";

import { getCapturableKeys, getNeutralizedKeys } from "@/game/grid";
import { getTile, keyToCoord } from "@/game/hex";

import { GameEvent } from "@/types/GameEvent";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

type GameBoardProps = {
  grid: HexTileData[][];
  selectedKeys: Set<string>;
  currentPlayer: Player;
  wins: Record<Player, number>;
  turn: number;
  /** Whole seconds left in the turn, or `null` when the clock is not running. */
  secondsLeft: number | null;
  /** Whether the word list is ready. */
  status: ComponentProps<typeof StatusMessage>["status"];
  /** Notices to show in the status line. */
  events: GameEvent[];
  /** Optional player the bot controls. */
  botPlayer?: Player;
  /** If a word is in the dictionary. */
  isValidWord: (word: string) => boolean;
  /** If the viewer can play now. */
  canPlay: boolean;
  /** Turns the board upside down. */
  flipped: boolean;
  onSelect: (coord: HexCoord) => void;
  onSubmit: () => void;
};

/**
 * Draws a game board:
 * 1. Scoreboard
 * 2. Notices
 * 3. Game grid
 * 4. Selected word
 * 5. Submit button
 */
export default function GameBoard({
  grid,
  selectedKeys,
  currentPlayer,
  wins,
  turn,
  secondsLeft,
  status,
  events,
  botPlayer,
  isValidWord,
  canPlay,
  flipped,
  onSelect,
  onSubmit,
}: GameBoardProps) {
  const capturableKeys = getCapturableKeys(grid, selectedKeys, currentPlayer);
  const neutralizedKeys = getNeutralizedKeys(
    grid,
    capturableKeys,
    currentPlayer,
  );
  const word = [...selectedKeys]
    .map((key) => getTile(grid, keyToCoord(key))?.character ?? "")
    .join("");
  const wordIsValid = isValidWord(word);

  return (
    <div className="flex h-full w-full max-w-xl justify-center">
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-(--gap) transition-transform duration-700 [--gap:clamp(0.5rem,1.5dvh,1rem)] motion-reduce:transition-none ${flipped ? "rotate-180" : ""}`}
      >
        <Scoreboard
          wins={wins}
          currentPlayer={currentPlayer}
          turn={turn}
          secondsLeft={secondsLeft}
          botPlayer={botPlayer}
        />

        <StatusMessage status={status} events={events} botPlayer={botPlayer} />

        <HexGrid
          grid={grid}
          selectedKeys={selectedKeys}
          capturableKeys={capturableKeys}
          currentPlayer={currentPlayer}
          neutralizedKeys={neutralizedKeys}
          onSelect={onSelect}
        />

        <div className="w-full shrink-0">
          <WordDisplay word={word} isValid={wordIsValid} />
        </div>

        <Button
          className="w-full shrink-0"
          onClick={onSubmit}
          disabled={!canPlay || !wordIsValid}
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
