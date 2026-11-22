"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import RulePreview from "@/components/tutorial/RulePreview";
import { RULES } from "@/components/tutorial/ruleList";
import { Button, buttonClass } from "@/components/ui";

import { useReducedMotion } from "@/hooks/useReducedMotion";

type RulesProps = {
  onShowTutorial: () => void;
};

const LAST_STEP = RULES.length - 1;

export default function Rules({ onShowTutorial }: RulesProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const handleScroll = (): void => {
    const list = listRef.current;
    if (!list) return;

    setStep(
      Math.min(LAST_STEP, Math.round(list.scrollLeft / list.clientWidth)),
    );
  };

  const showStep = (index: number): void => {
    const list = listRef.current;
    list?.scrollTo({
      left: index * list.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight" && step < LAST_STEP) showStep(step + 1);
      else if (event.key === "ArrowLeft" && step > 0) showStep(step - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <ol
        ref={listRef}
        aria-label="Rules"
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {RULES.map((rule, index) => (
          <li
            key={rule.title}
            className="flex w-full shrink-0 snap-start snap-always items-center px-1"
          >
            <div
              className={`flex w-full flex-col gap-2 rounded-md border-2 px-5 py-4 ${
                index === 0 ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {rule.title}
              </h2>
              <p className="text-sm leading-6">{rule.text}</p>
              {rule.preview && <RulePreview preview={rule.preview} />}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex shrink-0 justify-center">
        {RULES.map((rule, index) => (
          <button
            key={rule.title}
            type="button"
            aria-label={`Show step ${index + 1}: ${rule.title}`}
            aria-current={index === step ? "step" : undefined}
            onClick={() => showStep(index)}
            className="cursor-pointer p-1.5"
          >
            <span
              className={`block size-2 rounded-full ${
                index === step ? "bg-accent" : "bg-border"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex w-full shrink-0 gap-2">
        {step > 0 ? (
          <Button
            variant="secondary"
            className="w-24 shrink-0"
            onClick={() => showStep(step - 1)}
          >
            BACK
          </Button>
        ) : (
          <Link
            href="/"
            className={buttonClass({
              variant: "secondary",
              className: "w-24 shrink-0",
            })}
          >
            MENU
          </Link>
        )}
        {step < LAST_STEP ? (
          <Button className="flex-1" onClick={() => showStep(step + 1)}>
            NEXT
          </Button>
        ) : (
          <Button className="flex-1" onClick={onShowTutorial}>
            PLAY THE TUTORIAL
          </Button>
        )}
      </div>
    </div>
  );
}
