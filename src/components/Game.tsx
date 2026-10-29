"use client";

import { useEffect, useState } from "react";

import FlipPrompt from "@/components/FlipPrompt";
import GameOverDialog from "@/components/GameOverDialog";
import HexGrid from "@/components/HexGrid";
import Scoreboard from "@/components/Scoreboard";
import WordDisplay from "@/components/WordDisplay";

import { chooseMove } from "@/game/bot";
import {
  NOTICE_MS,
  PLAYERS,
  TURN_PAUSE_MS,
  TURN_SECONDS,
} from "@/game/constants";

import { Dictionary } from "@/game/dictionary";
import { describeEvents } from "@/game/events";
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

import { useBotTurn } from "@/hooks/useBotTurn";
import { useCountdown } from "@/hooks/useCountdown";
import { useMounted } from "@/hooks/useMounted";
import { useWordValidator } from "@/hooks/useWordValidator";

import { useFlip } from "@/lib/settings";

import { GameEvent } from "@/types/GameEvent";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

const STATUS_MESSAGE = {
  loading: "Loading word list...",
  ready: "",
  error: "Could not load words. Refresh to retry.",
} as const;

type GameProps = {
  botPlayer?: Player;
};

/** Game state handler. */
export default function Game({ botPlayer }: GameProps) {
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
  const [events, setEvents] = useState<GameEvent[]>([]);
  const { status, dictionary, isValidWord } = useWordValidator();
  const [flip, setFlip] = useFlip();
  const mounted = useMounted();

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
    setGrid(dealNeutral(grid, dictionary));
  }

  useEffect(() => {
    if (events.length === 0) return;

    const timeout = setTimeout(() => setEvents([]), NOTICE_MS);
    return () => clearTimeout(timeout);
  }, [events]);

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
    const reformed = pending.delete(nextToMove);
    const finalGrid = reformed ? reformCapital(newGrid, nextToMove) : newGrid;
    const playableGrid = ensurePlayable(finalGrid, dictionary);

    const nextEvents: GameEvent[] = [...lostCapitalPlayers].map(
      (loser): GameEvent => ({
        type: "capital-captured",
        captor: currentPlayer,
        loser,
      }),
    );
    if (reformed) {
      nextEvents.push({ type: "capital-reformed", player: nextToMove });
    }
    if (playableGrid !== finalGrid) {
      nextEvents.push({ type: "redeal", reason: "no-playable-word" });
    }

    setPendingCapitals(pending);
    setGrid(playableGrid);
    setEvents(newResult.over ? [] : nextEvents);
    setPassStarter(null);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(nextToMove);
  };

  const handlePass = (): void => {
    if (result.over || !dictionary) return;

    const nextToMove = nextPlayer(currentPlayer);
    const pending = new Set(pendingCapitals);
    const reformed = pending.delete(nextToMove);
    const reformedGrid = reformed ? reformCapital(grid, nextToMove) : grid;

    const starter = passStarter ?? currentPlayer;
    const redeal = nextToMove === starter;

    const nextEvents: GameEvent[] = [
      { type: "timeout", player: currentPlayer },
    ];
    if (reformed) {
      nextEvents.push({ type: "capital-reformed", player: nextToMove });
    }
    if (redeal) nextEvents.push({ type: "redeal", reason: "all-passed" });

    setPendingCapitals(pending);
    setGrid(redeal ? dealNeutral(reformedGrid, dictionary) : reformedGrid);
    setEvents(nextEvents);
    setPassStarter(redeal ? null : starter);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(nextToMove);
  };

  const secondsLeft = useCountdown({
    running: status === "ready" && !result.over && !promptOpen,
    durationSeconds: TURN_SECONDS,
    startDelayMs: TURN_PAUSE_MS,
    resetKey: turn,
    onExpire: handlePass,
  });

  const selectKey = (key: string): void =>
    setSelectedKeys((prev) => new Set(prev).add(key));

  useBotTurn({
    enabled: isBotTurn,
    resetKey: turn,
    chooseMove: () =>
      dictionary ? chooseMove(grid, currentPlayer, dictionary) : null,
    onSelect: selectKey,
    onSubmit: handleSubmit,
  });

  const resetGame = (): void => {
    if (!dictionary) return;

    setGrid(dealNeutral(initHexGrid(), dictionary));
    setEvents([]);
    setPassStarter(null);
    setSelectedKeys(new Set());
    setPendingCapitals(new Set());
    setTurn(1);
    setCurrentPlayer(PLAYERS[0]);
  };

  const statusMessage = STATUS_MESSAGE[status];
  const notice = describeEvents(events);
  const message = statusMessage || notice;

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
        />

        <div className="relative flex h-8 w-full shrink-0 items-center justify-center">
          {message && (
            <span
              key={message}
              aria-hidden
              className={
                statusMessage
                  ? "px-2 text-center font-sans text-base leading-6 font-medium text-foreground"
                  : "animate-[notice-pop_0.3s_ease-out] rounded-full bg-foreground px-4 py-1 text-center font-sans text-base leading-6 font-semibold text-background motion-reduce:animate-none"
              }
            >
              {message}
            </span>
          )}

          <p role="status" className="sr-only">
            {message}
          </p>
        </div>

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
        <GameOverDialog winner={result.winner} resetGame={resetGame} />
      )}
    </div>
  );
}
