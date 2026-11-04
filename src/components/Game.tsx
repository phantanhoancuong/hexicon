"use client";

import { useState } from "react";

import FlipPrompt from "@/components/FlipPrompt";
import GameOverDialog from "@/components/GameOverDialog";
import HexGrid from "@/components/HexGrid";
import Scoreboard from "@/components/Scoreboard";
import StatusMessage from "@/components/StatusMessage";
import WordDisplay from "@/components/WordDisplay";

import { chooseMove } from "@/game/bot";
import { PROFILES } from "@/game/botProfiles";
import { PLAYERS, TURN_PAUSE_MS, TURN_SECONDS } from "@/game/constants";

import { Dictionary } from "@/game/dictionary";
import { applyMove, createGameState, dealState, nextGame } from "@/game/game";
import {
  getCapturableKeys,
  getGameResult,
  getNeutralizedKeys,
  isSelectable,
} from "@/game/grid";
import { coordToKey, getTile, keyToCoord } from "@/game/hex";

import { useBotTurn } from "@/hooks/useBotTurn";
import { useCountdown } from "@/hooks/useCountdown";
import { useDictionary } from "@/hooks/useDictionary";
import { useMounted } from "@/hooks/useMounted";
import { useNoticeEvents } from "@/hooks/useNoticeEvents";

import { useAlternate, useDifficulty, useFlip } from "@/lib/settings";

import { GameState, PassReason } from "@/types/GameState";
import { HexCoord, Player } from "@/types/HexTile";

type GameProps = {
  /** Optional bot player. */
  botPlayer?: Player;
};

/** Game state handler. */
export default function Game({ botPlayer }: GameProps) {
  const [state, setState] = useState<GameState>(() => createGameState());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [dealtFor, setDealtFor] = useState<Dictionary | null>(null);
  const [events, setEvents] = useNoticeEvents();
  const { status, dictionary, isValidWord } = useDictionary();
  const [flip, setFlip] = useFlip();
  const [alternate] = useAlternate();
  const [difficulty] = useDifficulty();
  const mounted = useMounted();

  const { grid, turn, currentPlayer, wins } = state;
  const result = getGameResult(grid);
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
  const canSubmit = !result.over && wordIsValid;
  const isBotTurn =
    botPlayer === currentPlayer && status === "ready" && !result.over;
  const canPress = canSubmit && !isBotTurn;
  const promptOpen = mounted && flip === null && botPlayer === undefined;
  const isFlipped =
    flip === true && botPlayer === undefined && currentPlayer === PLAYERS[1];

  // Letters are dealt once the word list is ready.
  if (dictionary && dealtFor !== dictionary) {
    setDealtFor(dictionary);
    setState(dealState(state, dictionary));
  }

  /**
   * Shows the state after a move and clears the selection.
   *
   * The "played" notice is only shown for the bot's moves, so local play looks the same as before.
   */
  const commit = (next: GameState): void => {
    setState(next);
    setEvents(
      next.events.filter(
        (event) => event.type !== "played" || event.player === botPlayer,
      ),
    );
    setSelectedKeys(new Set());
  };

  /** Toggles a tile in the current word. */
  const handleSelect = (coord: HexCoord): void => {
    if (result.over || isBotTurn) return;

    const tile = getTile(grid, coord);
    if (!tile || !isSelectable(tile)) return;

    const key = coordToKey(coord);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /** Plays the selected word. Does nothing if the move is refused. */
  const handleSubmit = (): void => {
    if (!canSubmit || !dictionary) return;

    const outcome = applyMove(
      state,
      { type: "submit", keys: [...selectedKeys] },
      dictionary,
    );
    if (outcome.ok) commit(outcome.state);
  };

  /**
   * Passes the turn, because time ran out or the bot has no move.
   *
   * @param reason - Why the turn is passed, shown as a notice. Defaults to a timeout.
   */
  const handlePass = (reason: PassReason = "timeout"): void => {
    if (!dictionary) return;

    const outcome = applyMove(state, { type: "pass", reason }, dictionary);
    if (outcome.ok) commit(outcome.state);
  };

  const secondsLeft = useCountdown({
    running: status === "ready" && !result.over && !promptOpen,
    durationSeconds: TURN_SECONDS,
    startDelayMs: TURN_PAUSE_MS,
    resetKey: turn,
    onExpire: () => handlePass(),
  });

  /** Selects a tile for the bot. */
  const selectKey = (key: string): void =>
    setSelectedKeys((prev) => new Set(prev).add(key));

  useBotTurn({
    enabled: isBotTurn,
    resetKey: turn,
    chooseMove: () =>
      dictionary
        ? chooseMove(grid, currentPlayer, dictionary, PROFILES[difficulty])
        : null,
    onSelect: selectKey,
    onSubmit: handleSubmit,
    onPass: () => handlePass("pass"),
  });

  /**
   * Starts the next game on a fresh board, updating and keeping the win counts.
   *
   * With ALTERNATE FIRST TURN on, the next player after the last game's starter goes first. Otherwise the same player starts again.
   */
  const resetGame = (): void => {
    if (!dictionary) return;

    setState(nextGame(state, dictionary, alternate));
    setEvents([]);
    setSelectedKeys(new Set());
  };

  return (
    <div className="flex h-full w-full max-w-xl justify-center">
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-(--gap) transition-transform duration-700 [--gap:clamp(0.5rem,1.5dvh,1rem)] motion-reduce:transition-none ${isFlipped ? "rotate-180" : ""}`}
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
          onSelect={handleSelect}
        />

        <div className="w-full shrink-0">
          <WordDisplay word={word} isValid={wordIsValid} />
        </div>

        <button
          className={`h-10 w-full shrink-0 rounded-md bg-accent font-semibold tracking-wide text-accent-foreground disabled:opacity-40 ${canPress ? "cursor-pointer" : "cursor-auto"}`}
          onClick={handleSubmit}
          disabled={!canPress}
        >
          SUBMIT
        </button>
      </div>

      {promptOpen && <FlipPrompt onChoose={setFlip} />}

      {result.over && (
        <GameOverDialog
          winner={result.winner}
          resetGame={resetGame}
          botPlayer={botPlayer}
        />
      )}
    </div>
  );
}
