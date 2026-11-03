import { useEffect, useRef } from "react";

import {
  BOT_SUBMIT_MS,
  BOT_THINK_MAX_MS,
  BOT_THINK_MIN_MS,
  BOT_TILE_MS,
  TURN_PAUSE_MS,
} from "@/game/constants";

type UseBotTurnOptions = {
  /** If it's the bot's turn and the game is running. */
  enabled: boolean;
  /** Changes every turn, so the bot plays once a turn. */
  resetKey: number;
  /** Picks the tile keys to select, in word order, or `null` if the bot passes. */
  chooseMove: () => string[] | null;
  /** Adds one tile to the selection. */
  onSelect: (key: string) => void;
  /** Submits the current selection. */
  onSubmit: () => void;
  /** Passes the turn. Called when the bot has no move to play. */
  onPass: () => void;
};

/**
 * Plays the bot's turn:
 *
 * - Waits out the pause at the start of the turn.
 * - Thinks for a random time.
 * - Picks a move.
 * - Selects its tiles one at a time.
 * - Holds the finished word for a bit so the player can read it.
 * - Submits the move.
 *
 * If the bot has no move, it passes after the thinking time.
 *
 * @param options - The bot turn settings.
 */
export const useBotTurn = (options: UseBotTurnOptions): void => {
  const { enabled, resetKey } = options;

  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    if (!enabled) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (ms: number, action: () => void): void => {
      timers.push(setTimeout(action, ms));
    };

    const thinkMs =
      BOT_THINK_MIN_MS + Math.random() * (BOT_THINK_MAX_MS - BOT_THINK_MIN_MS);

    later(TURN_PAUSE_MS + thinkMs, () => {
      const move = latest.current.chooseMove();
      if (!move) {
        latest.current.onPass();
        return;
      }

      move.forEach((key, i) => {
        later((i + 1) * BOT_TILE_MS, () => latest.current.onSelect(key));
      });
      later(move.length * BOT_TILE_MS + BOT_SUBMIT_MS, () =>
        latest.current.onSubmit(),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [enabled, resetKey]);
};
