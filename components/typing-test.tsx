"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTypingTest } from "@/hooks/use-typing-test";
import { WordsDisplay } from "./words-display";
import { ConfigBar } from "./config-bar";
import { ResultsPanel } from "./results-panel";
import { ThemeToggle } from "./theme-toggle";

function RestartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

export function TypingTest() {
  const {
    status,
    language,
    duration,
    timeLeft,
    words,
    typed,
    activeWord,
    stats,
    bestWpm,
    isNewRecord,
    liveWpm,
    setLanguage,
    setDuration,
    restart,
  } = useTypingTest();

  // Restart with Tab or Enter once the test has finished.
  useEffect(() => {
    if (status !== "finished") return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Tab" || event.key === "Enter") {
        event.preventDefault();
        restart();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, restart]);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-10 px-4">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-tt-text">
          <span className="text-tt-main">monkey</span>type clone
        </h1>
        <ThemeToggle />
      </header>

      <ConfigBar
        language={language}
        duration={duration}
        onLanguageChange={setLanguage}
        onDurationChange={setDuration}
        hidden={status !== "idle"}
      />

      <AnimatePresence mode="wait">
        {status === "finished" && stats ? (
          <ResultsPanel
            key="results"
            stats={stats}
            bestWpm={bestWpm}
            isNewRecord={isNewRecord}
          />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex w-full flex-col gap-6"
          >
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-semibold text-tt-main tabular-nums">
                {timeLeft}
              </span>
              {status === "running" && (
                <span className="text-sm text-tt-sub tabular-nums">
                  {liveWpm} wpm
                </span>
              )}
            </div>

            {words.length > 0 ? (
              <WordsDisplay
                words={words}
                typed={typed}
                activeWord={activeWord}
                status={status}
              />
            ) : (
              <div className="h-32" />
            )}

            {status === "idle" && (
              <p className="text-center text-sm text-tt-sub">
                Start typing to begin the test
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={restart}
        aria-label="Restart test"
        className="rounded-lg p-2 text-tt-sub transition-colors hover:bg-tt-sub/15 hover:text-tt-text"
      >
        <RestartIcon />
      </button>
    </div>
  );
}
