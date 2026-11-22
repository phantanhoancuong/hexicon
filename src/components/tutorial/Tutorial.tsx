"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import GameBoard, { type PlayedWord } from "@/components/game/GameBoard";
import Callout from "@/components/tutorial/Callout";
import CompleteDialog from "@/components/tutorial/CompleteDialog";
import {
  gridAfterPage,
  gridForPage,
  isStep,
  PAGES,
  pathWord,
  TUTORIAL_PLAYER,
} from "@/components/tutorial/steps";
import { Button, buttonClass } from "@/components/ui";

import { getGameResult } from "@/game/grid";
import { coordToKey, getTile } from "@/game/hex";
import { Perspective } from "@/game/names";

import { useSounds } from "@/hooks/useSounds";

import { useTutorialDone } from "@/lib/tutorialProgress";

import { HexCoord, HexTileData } from "@/types/HexTile";

type TutorialProps = {
  onShowRules: () => void;
};

const PERSPECTIVE: Perspective = { kind: "bot", bot: 2 };

const STEP_COUNT = PAGES.filter(isStep).length;

const DIM_CLASS = "opacity-30";

const SWIPE_MIN_PX = 50;

const SWIPE_MAX_MS = 600;

const COMPLETE_DIALOG_DELAY_MS = 1000;

export default function Tutorial({ onShowRules }: TutorialProps) {
  const [page, setPage] = useState(0);
  const [grid, setGrid] = useState(() => gridForPage(0));
  const [tapped, setTapped] = useState(0);
  const [done, setDone] = useState(false);
  const [explained, setExplained] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [played, setPlayed] = useState<PlayedWord>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setTutorialDone] = useTutorialDone();
  const playSound = useSounds();

  const current = PAGES[page];
  const info = current && !isStep(current) ? current : undefined;
  const step = current && isStep(current) ? current : undefined;
  const atEnd = page >= PAGES.length - 1 && !step;
  const result = getGameResult(grid);
  const gameOver = atEnd && result.over;

  const stepsBefore = PAGES.slice(0, page).filter(isStep).length;

  const path = step?.taps.map((tap) => tap.at) ?? [];
  const selectedKeys = new Set(path.slice(0, tapped).map(coordToKey));
  const allTapped = step !== undefined && !done && tapped === path.length;
  const explaining =
    allTapped && explained < step.explain.length
      ? step.explain[explained]
      : undefined;
  const target = step && !done ? path[tapped] : undefined;
  const readyToSubmit = allTapped && !explaining;
  const outcome =
    step && done
      ? {
          text: step.success,
          focus: (after: HexTileData[][]) => {
            const before = gridForPage(page);
            const changed = after
              .flat()
              .filter((tile) => {
                const was = getTile(before, tile.coord)?.status;
                return (
                  (was === 1 || was === 2) &&
                  was !== TUTORIAL_PLAYER &&
                  tile.status !== was
                );
              })
              .map((tile) => tile.coord);
            return [...path, ...changed];
          },
        }
      : undefined;
  const popup = info ?? explaining ?? outcome;
  const focusKeys = new Set((popup?.focus?.(grid) ?? []).map(coordToKey));

  const goTo = useCallback((next: number): void => {
    setPage(next);
    setGrid(gridForPage(next));
    setTapped(0);
    setDone(false);
    setExplained(0);
    setNudge(false);
    setPlayed(undefined);
  }, []);

  const goNext = (): void => {
    if (explaining) setExplained(explained + 1);
    else goTo(page + 1);
  };

  const goBack = (): void => {
    if (allTapped && explained > 0) setExplained(explained - 1);
    else goTo(page - 1);
  };

  useEffect(() => {
    if (gameOver) setTutorialDone(true);
  }, [gameOver, setTutorialDone]);

  useEffect(() => {
    if (!gameOver) return;
    const timer = setTimeout(() => {
      setDialogOpen(true);
      playSound("over");
    }, COMPLETE_DIALOG_DELAY_MS);
    return () => clearTimeout(timer);
  }, [gameOver, playSound]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight" && popup && !atEnd) goNext();
      else if (event.key === "ArrowLeft" && page > 0 && !gameOver) goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      if (!popup || atEnd || !(event.target instanceof Element)) return;
      const onTile = event.target.closest("[data-key]") !== null;
      if (!onTile && event.target.closest("button, a, input") !== null) return;
      goNext();
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  });

  useEffect(() => {
    let start: { x: number; y: number; time: number } | undefined;

    const onTouchStart = (event: TouchEvent): void => {
      const touch = event.touches[0];
      start =
        event.touches.length === 1
          ? { x: touch.clientX, y: touch.clientY, time: Date.now() }
          : undefined;
    };

    const onTouchEnd = (event: TouchEvent): void => {
      const touch = event.changedTouches[0];
      if (!start || !touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const quick = Date.now() - start.time < SWIPE_MAX_MS;
      start = undefined;
      if (!quick || Math.abs(dx) < SWIPE_MIN_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx < 0 && popup && !atEnd) goNext();
      else if (dx > 0 && page > 0 && !gameOver) goBack();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  });

  const handleSelect = (coord: HexCoord): void => {
    if (!target) return;

    if (coordToKey(coord) === coordToKey(target)) {
      playSound("select", tapped);
      setNudge(false);
      setTapped(tapped + 1);
    } else if (getTile(grid, coord)?.status === "neutral") {
      setNudge(true);
    }
  };

  const handleSubmit = (): void => {
    if (!readyToSubmit) return;

    playSound("play");
    setPlayed({
      player: TUTORIAL_PLAYER,
      word: pathWord(grid, path),
      keys: path.map(coordToKey),
    });
    setGrid(gridAfterPage(page));
    setTapped(0);
    setDone(true);
  };

  const tileClassName = (key: string): string => {
    if (popup) return popup.focus && !focusKeys.has(key) ? DIM_CLASS : "";
    if (!step || done || selectedKeys.has(key)) return "";

    const [q, r] = key.split(",").map(Number);
    if (getTile(grid, { q, r })?.status !== "neutral") return "";

    return target && key === coordToKey(target) ? "" : DIM_CLASS;
  };

  const coachText = ((): string => {
    if (popup || !step) return "";
    if (readyToSubmit) return step.ready;
    if (nudge) return "Tap the bright tile";
    return step.taps[tapped].text;
  })();

  const main = atEnd ? (
    <Link href="/" className={buttonClass({ className: "flex-1" })}>
      BACK TO MENU
    </Link>
  ) : (
    <Button
      className={`flex-1 ${readyToSubmit ? "animate-pulse" : ""}`}
      onClick={handleSubmit}
      disabled={!readyToSubmit}
    >
      SUBMIT
    </Button>
  );

  const controls = (
    <div
      className={`flex w-full shrink-0 gap-2 transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${dialogOpen ? "invisible opacity-0" : ""}`}
    >
      {page > 0 && (
        <Button variant="secondary" className="w-24 shrink-0" onClick={goBack}>
          BACK
        </Button>
      )}
      {main}
    </div>
  );

  const occupiedIds = grid
    .flat()
    .filter((tile) => tile.status !== "uninitialized")
    .map((tile) => coordToKey(tile.coord))
    .join("|");

  return (
    <>
      <GameBoard
        grid={grid}
        selectedKeys={selectedKeys}
        currentPlayer={TUTORIAL_PLAYER}
        wins={{ 1: 0, 2: 0 }}
        turn={Math.min(stepsBefore, STEP_COUNT - 1) + 1}
        secondsLeft={null}
        status="ready"
        events={[]}
        notice={coachText}
        perspective={PERSPECTIVE}
        isValidWord={(word) => word !== ""}
        played={played}
        canPlay={readyToSubmit}
        flipped={false}
        tileClassName={tileClassName}
        footer={controls}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
      />
      {popup && (
        <Callout
          text={popup.text}
          targetIds={[...focusKeys].join("|")}
          occupiedIds={occupiedIds}
          onTap={atEnd ? undefined : goNext}
          onBack={page > 0 ? goBack : undefined}
        />
      )}
      {dialogOpen && (
        <CompleteDialog
          onShowRules={onShowRules}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
