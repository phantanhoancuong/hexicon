"use client";

import { useState } from "react";

import GameBoard, { type PlayedWord } from "@/components/game/GameBoard";
import GameOverDialog from "@/components/game/GameOverDialog";
import { Button } from "@/components/ui";

import { TURN_SECONDS } from "@/game/constants";
import { getGameResult, isSelectable } from "@/game/grid";
import { coordToKey, getTile } from "@/game/hex";
import { Perspective } from "@/game/names";

import { useDeadlineCountdown } from "@/hooks/useDeadlineCountdown";
import { useDictionary } from "@/hooks/useDictionary";
import { useNoticeEvents } from "@/hooks/useNoticeEvents";
import type { GameView, RoomView } from "@/hooks/useOnlineRoom";

import { HexCoord } from "@/types/HexTile";

type OnlineGameProps = {
  game: GameView;
  room: RoomView;
  opponentSelection: string[];
  connected: boolean;
  onSubmit: (keys: string[]) => void;
  onSelectionChange: (keys: string[]) => void;
  onPlayAgain: () => void;
  onLeave: () => void;
};

const describeRematch = ({ self, opponent }: RoomView): string => {
  if (opponent === null || !opponent.connected)
    return "Your opponent disconnected";
  if (self.ready) return "Waiting for your opponent";
  if (opponent.ready) return "Your opponent wants to play again";
  return "";
};

export default function OnlineGame({
  game,
  room,
  opponentSelection,
  connected,
  onSubmit,
  onSelectionChange,
  onPlayAgain,
  onLeave,
}: OnlineGameProps) {
  const { state, you, turnEndsAt } = game;
  const { grid, turn, currentPlayer, wins } = state;

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [shownTurn, setShownTurn] = useState(turn);
  const [events, setEvents] = useNoticeEvents();
  const { status, isValidWord } = useDictionary();
  const secondsLeft = useDeadlineCountdown(turnEndsAt, TURN_SECONDS);

  const playedEvent = events.find((event) => event.type === "played");
  const played: PlayedWord | undefined = playedEvent && {
    player: playedEvent.player,
    word: playedEvent.word,
    keys: playedEvent.keys,
  };

  const perspective: Perspective = { kind: "online", you };
  const result = getGameResult(grid);
  const isMyTurn = currentPlayer === you && !result.over && connected;

  const isTheirTurn = currentPlayer !== you && !result.over;

  if (shownTurn !== turn) {
    setShownTurn(turn);
    setSelectedKeys(new Set());
    setEvents(state.events);
  }

  /** Toggles a tile in the current word. */
  const handleSelect = (coord: HexCoord): void => {
    if (!isMyTurn) return;

    const tile = getTile(grid, coord);
    if (!tile || !isSelectable(tile)) return;

    const key = coordToKey(coord);
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);

    setSelectedKeys(next);
    onSelectionChange([...next]);
  };

  /** Sends the selected word to the server to check and submit */
  const handleSubmit = (): void => {
    if (!isMyTurn) return;
    onSubmit([...selectedKeys]);
  };

  return (
    <>
      <GameBoard
        grid={grid}
        selectedKeys={isTheirTurn ? new Set(opponentSelection) : selectedKeys}
        currentPlayer={currentPlayer}
        wins={wins}
        turn={turn}
        secondsLeft={secondsLeft}
        status={status}
        events={events}
        perspective={perspective}
        isValidWord={isValidWord}
        played={played}
        canPlay={isMyTurn}
        flipped={false}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
      />

      {result.over && (
        <GameOverDialog winner={result.winner} perspective={perspective}>
          <p
            role="status"
            className="min-h-5 text-center text-sm text-muted-foreground"
          >
            {describeRematch(room)}
          </p>
          <Button
            autoFocus
            className="w-full"
            disabled={room.self.ready}
            onClick={onPlayAgain}
          >
            PLAY AGAIN
          </Button>
          <button
            type="button"
            onClick={onLeave}
            className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Leave room
          </button>
        </GameOverDialog>
      )}
    </>
  );
}
