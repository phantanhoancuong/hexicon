"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { COACH_CLASS } from "@/lib/noticeStyles";

type CalloutProps = {
  text: string;
  targetIds: string;
  occupiedIds: string;
  onTap?: () => void;
  onBack?: () => void;
};

type Placement = {
  left: number;
  top: number;
};

type Box = { left: number; right: number; top: number; bottom: number };

const EDGE = 8;

const REACH = 40;

const SPAN = 8;

const FOCUS_GAP = 4;

const FOCUS_CLASH = 1_000_000;

const TARGET_WEIGHT = 50;

/** Center point of a box. */
const centerOf = (box: Box) => ({
  x: (box.left + box.right) / 2,
  y: (box.top + box.bottom) / 2,
});

/** Area where two boxes overlap, in square pixels. */
const overlapArea = (a: Box, b: Box): number =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/** Small arrow pointing left or right. */
function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function Callout({
  text,
  targetIds,
  occupiedIds,
  onTap,
  onBack,
}: CalloutProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [placement, setPlacement] = useState<Placement>();

  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, [text]);

  useLayoutEffect(() => {
    const place = (): void => {
      const bubble = bubbleRef.current;
      const tiles = [...document.querySelectorAll<HTMLElement>("[data-key]")];
      if (!bubble) return;

      if (tiles.length === 0) {
        setPlacement({
          left: (window.innerWidth - bubble.offsetWidth) / 2,
          top: (window.innerHeight - bubble.offsetHeight) / 2,
        });
        return;
      }

      const boxes = tiles.map((tile) => ({
        key: tile.dataset.key ?? "",
        box: tile.getBoundingClientRect(),
      }));
      const board = centerOf({
        left: Math.min(...boxes.map(({ box }) => box.left)),
        right: Math.max(...boxes.map(({ box }) => box.right)),
        top: Math.min(...boxes.map(({ box }) => box.top)),
        bottom: Math.max(...boxes.map(({ box }) => box.bottom)),
      });

      const targets = new Set(targetIds.split("|"));
      const occupied = new Set(occupiedIds.split("|"));
      const distance = (box: Box): number => {
        const c = centerOf(box);
        return Math.hypot(c.x - board.x, c.y - board.y);
      };
      const anchor = boxes
        .filter(({ key }) => targets.has(key))
        .sort((a, b) => distance(a.box) - distance(b.box))[0];

      const to = anchor ? centerOf(anchor.box) : board;
      const blocked = boxes
        .filter(({ key }) => occupied.has(key))
        .map(({ box }) => box);
      const focus = boxes
        .filter(({ key }) => targets.has(key))
        .map(({ box }) => ({
          left: box.left - FOCUS_GAP,
          right: box.right + FOCUS_GAP,
          top: box.top - FOCUS_GAP,
          bottom: box.bottom + FOCUS_GAP,
        }));
      const width = bubble.offsetWidth;
      const height = bubble.offsetHeight;
      const halfWidth = width / 2;
      const minX = EDGE + halfWidth;
      const maxX = window.innerWidth - EDGE - halfWidth;

      const boardTop = Math.min(...boxes.map(({ box }) => box.top));
      const boardBottom = Math.max(...boxes.map(({ box }) => box.bottom));
      const minY = boardTop - REACH + height / 2;
      const maxY = boardBottom + REACH - height / 2;

      let from = board;
      let best = Infinity;
      for (let y = minY; y <= maxY; y += SPAN) {
        for (let x = minX; x <= Math.max(maxX, minX); x += SPAN) {
          const box = {
            left: x - halfWidth,
            right: x + halfWidth,
            top: y - height / 2,
            bottom: y + height / 2,
          };
          const covered = focus.reduce(
            (sum, other) => sum + overlapArea(box, other),
            0,
          );
          const cost =
            (covered > 0 ? FOCUS_CLASH + covered * TARGET_WEIGHT : 0) +
            blocked.reduce((sum, other) => sum + overlapArea(box, other), 0) +
            Math.hypot(x - to.x, y - to.y) +
            Math.abs(x - board.x);
          if (cost < best) {
            best = cost;
            from = { x, y };
          }
        }
      }

      setPlacement({
        left: from.x - halfWidth,
        top: from.y - height / 2,
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [text, targetIds, occupiedIds]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <div
        key={text}
        ref={bubbleRef}
        style={
          placement
            ? { left: placement.left, top: placement.top }
            : { opacity: 0 }
        }
        className={`pointer-events-auto absolute flex w-max max-w-64 items-stretch ${COACH_CLASS}`}
      >
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="flex cursor-pointer items-center rounded-l-2xl py-1 pr-1 pl-3 opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Chevron direction="left" />
          </button>
        )}
        {onTap ? (
          <button
            ref={nextRef}
            type="button"
            data-popup=""
            onClick={onTap}
            className={`flex flex-1 cursor-pointer items-center gap-2 rounded-r-2xl py-1 pr-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${onBack ? "pl-2" : "rounded-l-2xl pl-4"}`}
          >
            <span className="text-center">{text}</span>
            <span className="sr-only">, press to continue</span>
            <Chevron direction="right" />
          </button>
        ) : (
          <p
            data-popup=""
            className={`py-1 pr-4 text-center ${onBack ? "pl-2" : "pl-4"}`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
