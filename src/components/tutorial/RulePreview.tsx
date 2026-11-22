"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import HexTile from "@/components/game/HexTile";
import {
  PREVIEW_PLAYER,
  previewFrames,
  type Preview,
  type PreviewFrame,
} from "@/components/tutorial/previews";

import { coordToKey } from "@/game/hex";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import {
  CAPTURABLE_CLASS,
  SELECTED_CLASS,
  STATUS_CLASS,
  THREATENED_CLASS,
} from "@/lib/tileStyles";

import { HexTileData } from "@/types/HexTile";

const HEX_OVERLAP = "calc(var(--hex-w) / -4)";

const VISIBLE_SHARE = 0.5;

const NOOP = (): void => {};

type RulePreviewProps = {
  preview: Preview;
};

const getColorClass = (tile: HexTileData, frame: PreviewFrame): string => {
  const key = coordToKey(tile.coord);
  if (frame.capturableKeys.has(key)) return CAPTURABLE_CLASS[PREVIEW_PLAYER];
  if (frame.selectedKeys.has(key)) return SELECTED_CLASS;
  if (frame.neutralizedKeys.has(key) && typeof tile.status === "number") {
    return THREATENED_CLASS[tile.status];
  }
  return STATUS_CLASS[tile.status];
};

export default function RulePreview({ preview }: RulePreviewProps) {
  const frames = useMemo(() => previewFrames(preview), [preview]);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const frame = frames[reducedMotion ? frames.length - 2 : index];

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIndex(0);
        setVisible(entry.isIntersecting);
      },
      { threshold: VISIBLE_SHARE },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) return;

    const timer = setTimeout(
      () => setIndex((index + 1) % frames.length),
      frames[index].holdMs,
    );
    return () => clearTimeout(timer);
  }, [frames, index, reducedMotion, visible]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      inert
      className="flex flex-col items-center gap-2 py-2"
    >
      <div className="flex flex-row items-center justify-center gap-0.5 [--hex-w:2.5rem] [@media(max-height:700px)]:[--hex-w:2rem]">
        {frame.grid.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col gap-0.5"
            style={{ marginLeft: columnIndex > 0 ? HEX_OVERLAP : 0 }}
          >
            {column.map((tile) => (
              <HexTile
                key={coordToKey(tile.coord)}
                tile={tile}
                colorClass={getColorClass(tile, frame)}
                onSelect={NOOP}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="min-h-7 font-mono text-lg font-semibold tracking-widest">
        {frame.word}
      </p>
    </div>
  );
}
