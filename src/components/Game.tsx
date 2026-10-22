"use client";

import { useEffect, useState } from "react";

import Board from "@/components/Board";
import GameOverDialog from "@/components/GameOverDialog";
import Scoreboard from "@/components/Scoreboard";

import { PLAYERS } from "@/game/constants";
import {
  getCapturableKeys,
  getGameResult,
  getNeutralizedKeys,
  initHexBoard,
  isSelectable,
  nextPlayer,
  randomizeNeutral,
  reformCapital,
  resolveSubmit,
} from "@/game/game";

import { coordToKey, getCell, keyToCoord } from "@/game/hex";
import { useWordValidator } from "@/hooks/useWordValidator";
import { HexCellData, HexCoord, Player } from "@/types/HexCell";

const STATUS_MESSAGE = {
  loading: "Loading word list...",
  ready: "",
  error: "Could not load the word list. Refresh to try again.",
} as const;

export default function Game() {
  const [board, setBoard] = useState<HexCellData[][]>(initHexBoard);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [turn, setTurn] = useState<number>(1);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYERS[0]);
  const [wins, setWins] = useState<Record<Player, number>>({ 1: 0, 2: 0 });
  const [pendingCapitals, setPendingCapitals] = useState<Set<Player>>(
    () => new Set(),
  );
  const { status, isValidWord } = useWordValidator();

  const result = getGameResult(board);
  const capturableKeys = getCapturableKeys(board, selectedKeys, currentPlayer);
  const word = [...selectedKeys]
    .map((key) => getCell(board, keyToCoord(key))?.character ?? "")
    .join("");

  const canSubmit = !result.over && isValidWord(word);
  const neutralizedKeys = getNeutralizedKeys(
    board,
    capturableKeys,
    currentPlayer,
  );

  useEffect(() => {
    setBoard((prev) => randomizeNeutral(prev));
  }, []);

  const handleSelect = (coord: HexCoord) => {
    if (result.over) return;

    const cell = getCell(board, coord);
    if (!cell || !isSelectable(cell)) return;

    const key = coordToKey(coord);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = (): void => {
    if (!canSubmit) return;

    const {
      board: newBoard,
      extraTurn,
      lostCapitalPlayers,
    } = resolveSubmit(board, selectedKeys, capturableKeys, currentPlayer);

    const newResult = getGameResult(newBoard);
    if (newResult.over) {
      const winner = newResult.winner;
      setWins((w) => ({ ...w, [winner]: w[winner] + 1 }));
    }

    const nextToMove = extraTurn ? currentPlayer : nextPlayer(currentPlayer);

    const pending = new Set([...pendingCapitals, ...lostCapitalPlayers]);
    const finalBoard = pending.delete(nextToMove)
      ? reformCapital(newBoard, nextToMove)
      : newBoard;

    setPendingCapitals(pending);
    setBoard(finalBoard);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(nextToMove);
  };

  const resetGame = (): void => {
    setBoard(randomizeNeutral(initHexBoard()));
    setSelectedKeys(new Set());
    setTurn(1);
    setCurrentPlayer(PLAYERS[0]);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <Scoreboard
        wins={wins}
        currentPlayer={currentPlayer}
        turn={turn}
        word={word}
      />

      <Board
        board={board}
        selectedKeys={selectedKeys}
        capturableKeys={capturableKeys}
        currentPlayer={currentPlayer}
        neutralizedKeys={neutralizedKeys}
        onSelect={handleSelect}
      />

      <p className="h-6 text-sm">{STATUS_MESSAGE[status]}</p>

      <button
        className={`h-10 w-full bg-red-500 disabled:opacity-40 ${canSubmit ? `cursor-pointer` : `cursor-auto`}`}
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
