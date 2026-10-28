import { useEffect, useRef } from "react";

import {
  BOT_SUBMIT_MS,
  BOT_THINK_MS,
  BOT_TILE_MS,
  TURN_PAUSE_MS,
} from "@/game/constants";

type UseBotTurnOptions = {
  /** If it's the bot's turn and the game is running. */
  enabled: boolean;
  /** Changes every turn, so the bot plays once a turn. */
  resetKey: number;
  /** Picks the tile keys to select, in word order, or `null` if there is no move available. */
  chooseMove: () => string[] | null;
  /** Adds one tile to the selection. */
  onSelect: (key: string) => void;
  /** Submits the current selection. */
  onSubmit: () => void;
};

/**
 * Plays the bot's turn: waits out the pause at the start of the turn, picks a move, selects its tiles one at a time, then submits.
 *
 * Everything is cancelled if the turn ends, the game resets or the component unmounts.
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

    later(TURN_PAUSE_MS + BOT_THINK_MS, () => {
      const move = latest.current.chooseMove();
      if (!move) return;

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
