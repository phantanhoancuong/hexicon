"use client";

import { useState } from "react";

import GameOverDialog from "@/components/GameOverDialog";
import HexGrid from "@/components/HexGrid";
import Scoreboard from "@/components/Scoreboard";
import WordDisplay from "@/components/WordDisplay";

import { PLAYERS, TURN_SECONDS } from "@/game/constants";
import {
  dealNeutral,
  ensurePlayable,
  getCapturableKeys,
  getGameResult,
  getNeutralizedKeys,
  initHexGrid,
  isSelectable,
  nextPlayer,
  reformCapital,
  resolveSubmit,
} from "@/game/game";
import { coordToKey, getTile, keyToCoord } from "@/game/hex";

import { useCountdown } from "@/hooks/useCountdown";
import { useWordValidator } from "@/hooks/useWordValidator";

import { Dictionary } from "@/game/dictionary";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

const STATUS_MESSAGE = {
  loading: "Loading word list...",
  ready: "",
  error: "Could not load the word list. Refresh to try again.",
} as const;

/** Game state handler. */
export default function Game() {
  const [grid, setGrid] = useState<HexTileData[][]>(initHexGrid);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [turn, setTurn] = useState<number>(1);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYERS[0]);
  const [wins, setWins] = useState<Record<Player, number>>({ 1: 0, 2: 0 });
  const [pendingCapitals, setPendingCapitals] = useState<Set<Player>>(
    () => new Set(),
  );
  const [passStarter, setPassStarter] = useState<Player | null>(null);
  const [dealtFor, setDealtFor] = useState<Dictionary | null>(null);
  const { status, dictionary, isValidWord } = useWordValidator();

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

  // Letters are dealt once the word list is ready.
  if (dictionary && dealtFor !== dictionary) {
    setDealtFor(dictionary);
    setGrid(dealNeutral(grid, dictionary));
  }

  const handleSelect = (coord: HexCoord): void => {
    if (result.over) return;

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

  const handleSubmit = (): void => {
    if (!canSubmit || !dictionary) return;

    const {
      grid: newGrid,
      extraTurn,
      lostCapitalPlayers,
    } = resolveSubmit(grid, selectedKeys, capturableKeys, currentPlayer);

    const newResult = getGameResult(newGrid);
    if (newResult.over) {
      const winner = newResult.winner;
      setWins((w) => ({ ...w, [winner]: w[winner] + 1 }));
    }

    const nextToMove = extraTurn ? currentPlayer : nextPlayer(currentPlayer);

    // A player who lost their capital gets a new one at the start of their turn.
    const pending = new Set([...pendingCapitals, ...lostCapitalPlayers]);
    const finalGrid = pending.delete(nextToMove)
      ? reformCapital(newGrid, nextToMove)
      : newGrid;

    setPendingCapitals(pending);
    setGrid(ensurePlayable(finalGrid, dictionary));
    setPassStarter(null);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(nextToMove);
  };

  const handlePass = (): void => {
    if (result.over || !dictionary) return;

    const nextToMove = nextPlayer(currentPlayer);
    const pending = new Set(pendingCapitals);
    const reformedGrid = pending.delete(nextToMove)
      ? reformCapital(grid, nextToMove)
      : grid;

    const starter = passStarter ?? currentPlayer;
    const reshuffle = nextToMove === starter;

    setPendingCapitals(pending);
    setGrid(reshuffle ? dealNeutral(reformedGrid, dictionary) : reformedGrid);
    setPassStarter(reshuffle ? null : starter);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(nextToMove);
  };

  const secondsLeft = useCountdown({
    running: status === "ready" && !result.over,
    durationSeconds: TURN_SECONDS,
    resetKey: turn,
    onExpire: handlePass,
  });

  const resetGame = (): void => {
    if (!dictionary) return;

    setGrid(dealNeutral(initHexGrid(), dictionary));
    setPassStarter(null);
    setSelectedKeys(new Set());
    setPendingCapitals(new Set());
    setTurn(1);
    setCurrentPlayer(PLAYERS[0]);
  };

  return (
    <div className="flex h-full w-full max-w-xl flex-col items-center justify-center gap-(--gap) [--gap:clamp(0.5rem,1.5dvh,1rem)]">
      <Scoreboard
        wins={wins}
        currentPlayer={currentPlayer}
        turn={turn}
        secondsLeft={secondsLeft}
      />

      <HexGrid
        grid={grid}
        selectedKeys={selectedKeys}
        capturableKeys={capturableKeys}
        currentPlayer={currentPlayer}
        neutralizedKeys={neutralizedKeys}
        onSelect={handleSelect}
      />

      <div className="relative w-full shrink-0">
        <WordDisplay word={word} isValid={wordIsValid} />

        {STATUS_MESSAGE[status] && (
          <p className="absolute inset-0 flex items-center justify-center bg-background font-sans text-sm text-muted-foreground">
            {STATUS_MESSAGE[status]}
          </p>
        )}
      </div>

      <button
        className={`h-10 w-full shrink-0 rounded-md bg-accent font-semibold tracking-wide text-accent-foreground disabled:opacity-40 ${canSubmit ? "cursor-pointer" : "cursor-auto"}`}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        SUBMIT
      </button>

      {result.over && (
        <GameOverDialog winner={result.winner} resetGame={resetGame} />
      )}
    </div>
  );
}
