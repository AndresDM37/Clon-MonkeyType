"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
    history,
    bestWpm,
    isNewRecord,
    liveWpm,
    setLanguage,
    setDuration,
    restart,
    handleKeyDown,
    handleInput,
  } = useTypingTest();

  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(true);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  // Keep the hidden input focused while a test is in progress.
  useEffect(() => {
    if (status !== "finished") focusInput();
  }, [status, focusInput]);

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

  const showOverlay = !focused && status !== "finished";

  const announcement =
    status === "finished" && stats
      ? `Time's up. ${stats.wpm} words per minute, ${stats.accuracy}% accuracy.`
      : status === "running"
        ? "Test started."
        : "";

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-10 px-4">
      {/* Hidden input drives typing (and triggers the virtual keyboard on mobile). */}
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Typing input"
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
        className="pointer-events-none fixed left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2 opacity-0"
      />

      {/* Screen-reader announcements. */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

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
            history={history}
            bestWpm={bestWpm}
            isNewRecord={isNewRecord}
          />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
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

            {/* Clicking the words refocuses the input. */}
            <div className="relative" onClick={focusInput}>
              {words.length > 0 ? (
                <div className={showOverlay ? "blur-sm transition" : "transition"}>
                  <WordsDisplay
                    words={words}
                    typed={typed}
                    activeWord={activeWord}
                    status={status}
                  />
                </div>
              ) : (
                <div className="h-32" />
              )}

              {showOverlay && (
                <button
                  type="button"
                  onClick={focusInput}
                  className="absolute inset-0 flex items-center justify-center text-sm font-medium text-tt-text"
                >
                  Click / tap to start typing
                </button>
              )}
            </div>

            {status === "idle" && !showOverlay && (
              <p className="text-center text-sm text-tt-sub">
                Start typing to begin the test
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          restart();
          focusInput();
        }}
        aria-label="Restart test"
        className="rounded-lg p-2 text-tt-sub transition-colors hover:bg-tt-sub/15 hover:text-tt-text"
      >
        <RestartIcon />
      </button>
    </div>
  );
}
