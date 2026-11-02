"use client";

import { useState } from "react";

import FlipPrompt from "@/components/FlipPrompt";
import GameOverDialog from "@/components/GameOverDialog";
import HexGrid from "@/components/HexGrid";
import Scoreboard from "@/components/Scoreboard";
import StatusMessage from "@/components/StatusMessage";
import WordDisplay from "@/components/WordDisplay";

import { chooseMove } from "@/game/bot";
import { PLAYERS, TURN_PAUSE_MS, TURN_SECONDS } from "@/game/constants";

import { Dictionary } from "@/game/dictionary";
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
import { useDictionary } from "@/hooks/useDictionary";
import { useMounted } from "@/hooks/useMounted";
import { useNoticeEvents } from "@/hooks/useNoticeEvents";

import { useAlternate, useFlip } from "@/lib/settings";

import { GameEvent } from "@/types/GameEvent";
import { HexCoord, HexTileData, Player } from "@/types/HexTile";

type GameProps = {
  /** The player the bot controls. Leave out for local play. */
  botPlayer?: Player;
};

/** Things that change when play passes to the next player. */
type TurnUpdate = {
  grid: HexTileData[][];
  /** Players who lost their capital. */
  pendingCapitals: Set<Player>;
  /** Notices to show this turn. */
  events: GameEvent[];
  nextToMove: Player;
  /** Who started the current run of passes (doesn't play a move), `null` if no one has passed. */
  firstPasser: Player | null;
};

/**
 * Hands the turn to a player.
 *
 * If the player doesn't have a capital, it will be reformed for them.
 *
 * @param grid - The hex grid before the player's turn starts.
 * @param pendingCapitals - Players who lost their capital.
 * @param player - The player whose turn is starting.
 * @returns The hex grid (with a new capital if needed), the players that still need to reform their capitals, and notices to show.
 */
function enterTurn(
  grid: HexTileData[][],
  pendingCapitals: Set<Player>,
  player: Player,
): Pick<TurnUpdate, "grid" | "pendingCapitals" | "events"> {
  const stillPending = new Set(pendingCapitals);
  const reformed = stillPending.delete(player);
  const events: GameEvent[] = reformed
    ? [{ type: "capital-reformed", player }]
    : [];

  return {
    grid: reformed ? reformCapital(grid, player) : grid,
    pendingCapitals: stillPending,
    events,
  };
}

/** Game state handler. */
export default function Game({ botPlayer }: GameProps) {
  const [grid, setGrid] = useState<HexTileData[][]>(initHexGrid);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [turn, setTurn] = useState<number>(1);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYERS[0]);
  const [gameStarter, setGameStarter] = useState<Player>(PLAYERS[0]);
  const [wins, setWins] = useState<Record<Player, number>>({ 1: 0, 2: 0 });
  const [pendingCapitals, setPendingCapitals] = useState<Set<Player>>(
    () => new Set(),
  );
  const [firstPasser, setFirstPasser] = useState<Player | null>(null);
  const [dealtFor, setDealtFor] = useState<Dictionary | null>(null);
  const [events, setEvents] = useNoticeEvents();
  const { status, dictionary, isValidWord } = useDictionary();
  const [flip, setFlip] = useFlip();
  const [alternate] = useAlternate();
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

  /** Applies a finished turn and passes play on. */
  const applyTurn = (update: TurnUpdate): void => {
    setGrid(update.grid);
    setPendingCapitals(update.pendingCapitals);
    setEvents(update.events);
    setFirstPasser(update.firstPasser);
    setSelectedKeys(new Set());
    setTurn((t) => t + 1);
    setCurrentPlayer(update.nextToMove);
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

  /**
   * Plays the selected word and passes the turn:
   *
   * 1. Captures elligible tiles, and records a win if that ends the game.
   * 2. Pick the next player.
   * 3. Gives that player a new capital if theirs was captured.
   * 4. Redeals the letters if no valid word can be played.
   *
   * Does nothing if the word is not valid.
   */
  const handleSubmit = (): void => {
    if (!canSubmit || !dictionary) return;

    const {
      grid: nextGrid,
      extraTurn,
      lostCapitalPlayers,
    } = resolveSubmit(grid, selectedKeys, capturableKeys, currentPlayer);

    const nextResult = getGameResult(nextGrid);
    if (nextResult.over) {
      const { winner } = nextResult;
      setWins((w) => ({ ...w, [winner]: w[winner] + 1 }));
    }

    const nextToMove = extraTurn ? currentPlayer : nextPlayer(currentPlayer);
    const next = enterTurn(
      nextGrid,
      new Set([...pendingCapitals, ...lostCapitalPlayers]),
      nextToMove,
    );
    const playableGrid = ensurePlayable(next.grid, dictionary);

    const events: GameEvent[] = [
      ...[...lostCapitalPlayers].map((loser): GameEvent => ({
        type: "capital-captured",
        captor: currentPlayer,
        loser,
      })),
      ...next.events,
    ];
    if (playableGrid !== next.grid) {
      events.push({ type: "redeal", reason: "no-playable-word" });
    }

    applyTurn({
      ...next,
      grid: playableGrid,
      events: nextResult.over ? [] : events,
      nextToMove,
      firstPasser: null,
    });
  };

  /**
   * Passes the turn when time runs out.
   *
   * 1. Picks the next player.
   * 2. Gives that player a new capital if theirs was captured.
   * 3. Redeals all letters if every player has passed in a row.
   */
  const handlePass = (): void => {
    if (result.over || !dictionary) return;

    const nextToMove = nextPlayer(currentPlayer);
    const opener = firstPasser ?? currentPlayer;
    const allPassed = nextToMove === opener;
    const next = enterTurn(grid, pendingCapitals, nextToMove);

    const events: GameEvent[] = [
      { type: "timeout", player: currentPlayer },
      ...next.events,
    ];
    if (allPassed) events.push({ type: "redeal", reason: "all-passed" });

    applyTurn({
      ...next,
      grid: allPassed ? dealNeutral(next.grid, dictionary) : next.grid,
      events,
      nextToMove,
      firstPasser: allPassed ? null : opener,
    });
  };

  const secondsLeft = useCountdown({
    running: status === "ready" && !result.over && !promptOpen,
    durationSeconds: TURN_SECONDS,
    startDelayMs: TURN_PAUSE_MS,
    resetKey: turn,
    onExpire: handlePass,
  });

  /** Selects a tile for the bot.*/
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

  /**
   * Starts the next game on a fresh board, updating and keeping the win counts.
   *
   * With ALTERNATE FIRST TURN on, the next player after the last game's starter goes first. Otherwise the same player starts again.
   */
  const resetGame = (): void => {
    if (!dictionary) return;

    const nextStarter = alternate ? nextPlayer(gameStarter) : gameStarter;

    setGrid(dealNeutral(initHexGrid(), dictionary));
    setEvents([]);
    setFirstPasser(null);
    setSelectedKeys(new Set());
    setPendingCapitals(new Set());
    setTurn(1);
    setGameStarter(nextStarter);
    setCurrentPlayer(nextStarter);
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
        />

        <StatusMessage status={status} events={events} />

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
