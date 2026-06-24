"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { GameStatus } from "@/lib/types";
import { Caret } from "./caret";

interface WordsDisplayProps {
  words: string[];
  typed: string[];
  activeWord: number;
  status: GameStatus;
}

/** Vertical gap between wrapped lines, in px. Must match the `gap-y-*` class. */
const ROW_GAP = 8;
/** Number of word-lines kept visible. */
const VISIBLE_LINES = 3;

interface CaretRect {
  x: number;
  y: number;
  height: number;
}

function letterClass(state: "correct" | "incorrect" | "extra" | "pending") {
  switch (state) {
    case "correct":
      return "text-tt-text";
    case "incorrect":
      return "text-tt-error";
    case "extra":
      return "text-tt-error-extra";
    case "pending":
      return "text-tt-sub";
  }
}

export function WordsDisplay({ words, typed, activeWord, status }: WordsDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [caret, setCaret] = useState<CaretRect>({ x: 0, y: 0, height: 0 });
  const [resizeTick, setResizeTick] = useState(0);

  // Determine which letter the caret should anchor to in the active word.
  const target = words[activeWord] ?? "";
  const typedActive = typed[activeWord] ?? "";
  const renderedCount = Math.max(target.length, typedActive.length, 1);
  const caretCharIndex = typedActive.length;
  const anchorIndex = caretCharIndex < renderedCount ? caretCharIndex : renderedCount - 1;
  const anchorSide: "left" | "right" =
    caretCharIndex < renderedCount ? "left" : "right";

  const setAnchor = useCallback((node: HTMLSpanElement | null) => {
    anchorRef.current = node;
  }, []);

  useLayoutEffect(() => {
    const node = anchorRef.current;
    const content = contentRef.current;
    if (!node || !content) return;
    const height = node.offsetHeight;
    const x =
      anchorSide === "right"
        ? node.offsetLeft + node.offsetWidth
        : node.offsetLeft;
    setCaret({ x, y: node.offsetTop, height });
  }, [typed, activeWord, words, status, resizeTick, anchorSide]);

  useEffect(() => {
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rowHeight = caret.height ? caret.height + ROW_GAP : 0;
  const scrollY = rowHeight ? Math.max(0, caret.y - rowHeight) : 0;
  const viewportHeight = rowHeight ? rowHeight * VISIBLE_LINES : undefined;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: viewportHeight }}
      aria-label="Words to type"
    >
      <motion.div
        ref={contentRef}
        className="relative flex flex-wrap gap-x-3 gap-y-2 text-2xl leading-relaxed md:text-3xl"
        animate={{ y: -scrollY }}
        transition={{ type: "spring", stiffness: 500, damping: 60, mass: 0.5 }}
      >
        {caret.height > 0 && (
          <Caret
            x={caret.x}
            y={caret.y}
            height={caret.height}
            blink={status !== "running"}
          />
        )}

        {words.map((word, wordIndex) => {
          const typedWord = typed[wordIndex] ?? "";
          const letters = word.split("");
          const extras = typedWord.slice(word.length).split("");
          const isActive = wordIndex === activeWord;
          const isPast = wordIndex < activeWord;
          const hasError =
            isPast &&
            (typedWord.length > word.length ||
              letters.some((ch, i) => typedWord[i] !== undefined && typedWord[i] !== ch) ||
              typedWord.length < word.length);

          return (
            <span
              key={wordIndex}
              className={`inline-flex border-b-2 ${
                hasError ? "border-tt-error/50" : "border-transparent"
              }`}
            >
              {letters.map((char, i) => {
                let state: "correct" | "incorrect" | "extra" | "pending";
                if (i < typedWord.length) {
                  state = typedWord[i] === char ? "correct" : "incorrect";
                } else {
                  state = "pending";
                }
                const isAnchor = isActive && i === anchorIndex;
                return (
                  <span
                    key={i}
                    ref={isAnchor ? setAnchor : undefined}
                    className={letterClass(state)}
                  >
                    {char}
                  </span>
                );
              })}
              {extras.map((char, i) => {
                const realIndex = word.length + i;
                const isAnchor = isActive && realIndex === anchorIndex;
                return (
                  <span
                    key={`extra-${i}`}
                    ref={isAnchor ? setAnchor : undefined}
                    className={letterClass("extra")}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
