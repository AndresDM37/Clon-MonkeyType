"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { Duration, GameStatus, Language, Stats } from "@/lib/types";
import { computeStats, generateWords } from "@/lib/typing";
import { getBestWpm, saveBestWpm } from "@/lib/storage";

const INITIAL_WORD_COUNT = 60;
const REFILL_WHEN_REMAINING = 15;
const REFILL_COUNT = 30;
/** Allow a few overflow characters past a word's length (shown as errors). */
const MAX_EXTRA_CHARS = 8;

interface State {
  status: GameStatus;
  language: Language;
  duration: Duration;
  timeLeft: number;
  words: string[];
  /** typed[i] is exactly what the user typed for word i. */
  typed: string[];
  activeWord: number;
  stats: Stats | null;
  bestWpm: number;
  isNewRecord: boolean;
}

type Action =
  | { type: "reset"; words: string[]; bestWpm: number }
  | { type: "setLanguage"; language: Language }
  | { type: "setDuration"; duration: Duration }
  | { type: "char"; char: string }
  | { type: "space" }
  | { type: "backspace"; whole: boolean }
  | { type: "appendWords"; words: string[] }
  | { type: "tick" }
  | { type: "record"; bestWpm: number; isNewRecord: boolean };

function createInitialState(language: Language, duration: Duration): State {
  return {
    status: "idle",
    language,
    duration,
    timeLeft: duration,
    words: [],
    typed: [""],
    activeWord: 0,
    stats: null,
    bestWpm: 0,
    isNewRecord: false,
  };
}

function finish(state: State): State {
  const elapsed = state.duration - state.timeLeft || state.duration;
  return {
    ...state,
    status: "finished",
    timeLeft: 0,
    stats: computeStats(state.words, state.typed, elapsed),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return {
        ...createInitialState(state.language, state.duration),
        words: action.words,
        bestWpm: action.bestWpm,
      };

    case "setLanguage":
      return { ...state, language: action.language };

    case "setDuration":
      return { ...state, duration: action.duration, timeLeft: action.duration };

    case "appendWords":
      return { ...state, words: [...state.words, ...action.words] };

    case "char": {
      if (state.status === "finished") return state;
      const target = state.words[state.activeWord] ?? "";
      const current = state.typed[state.activeWord] ?? "";
      if (current.length >= target.length + MAX_EXTRA_CHARS) return state;

      const typed = [...state.typed];
      typed[state.activeWord] = current + action.char;
      return {
        ...state,
        status: state.status === "idle" ? "running" : state.status,
        typed,
      };
    }

    case "space": {
      if (state.status === "finished") return state;
      const current = state.typed[state.activeWord] ?? "";
      if (current.length === 0) return state; // ignore leading spaces
      const next = state.activeWord + 1;
      const typed = [...state.typed];
      if (typed[next] === undefined) typed[next] = "";
      return {
        ...state,
        status: state.status === "idle" ? "running" : state.status,
        typed,
        activeWord: next,
      };
    }

    case "backspace": {
      if (state.status === "finished") return state;
      const current = state.typed[state.activeWord] ?? "";
      const typed = [...state.typed];

      if (current.length > 0) {
        typed[state.activeWord] = action.whole ? "" : current.slice(0, -1);
        return { ...state, typed };
      }
      // At the start of a word: step back to the previous one (if any).
      if (state.activeWord > 0) {
        const prev = state.activeWord - 1;
        if (action.whole) typed[prev] = "";
        return { ...state, typed, activeWord: prev };
      }
      return state;
    }

    case "tick": {
      if (state.status !== "running") return state;
      if (state.timeLeft <= 1) return finish({ ...state, timeLeft: 0 });
      return { ...state, timeLeft: state.timeLeft - 1 };
    }

    case "record":
      return { ...state, bestWpm: action.bestWpm, isNewRecord: action.isNewRecord };

    default:
      return state;
  }
}

export function useTypingTest(
  initialLanguage: Language = "en",
  initialDuration: Duration = 30,
) {
  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(initialLanguage, initialDuration),
  );

  const { status, language, duration, words, activeWord } = state;

  /** Regenerate words and start a fresh test with the current config. */
  const restart = useCallback(() => {
    dispatch({
      type: "reset",
      words: generateWords(language, INITIAL_WORD_COUNT),
      bestWpm: getBestWpm(language, duration),
    });
  }, [language, duration]);

  // Start (and restart whenever language or duration changes).
  useEffect(() => {
    restart();
  }, [restart]);

  // Countdown timer.
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Keep a comfortable buffer of upcoming words so the test never runs dry.
  useEffect(() => {
    if (words.length - activeWord <= REFILL_WHEN_REMAINING) {
      dispatch({ type: "appendWords", words: generateWords(language, REFILL_COUNT) });
    }
  }, [words.length, activeWord, language]);

  // Persist the best score once a test finishes.
  useEffect(() => {
    if (status !== "finished" || !state.stats) return;
    const isNewRecord = saveBestWpm(language, duration, state.stats.wpm);
    dispatch({
      type: "record",
      bestWpm: getBestWpm(language, duration),
      isNewRecord,
    });
  }, [status, state.stats, language, duration]);

  // Global keyboard handling.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.altKey) return;
      if (state.status === "finished") return;
      // Don't hijack keys while a button (e.g. theme switch) is focused.
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select")) return;

      const { key } = event;
      if (key === " ") {
        event.preventDefault();
        dispatch({ type: "space" });
      } else if (key === "Backspace") {
        event.preventDefault();
        dispatch({ type: "backspace", whole: event.ctrlKey });
      } else if (key.length === 1 && !event.ctrlKey) {
        event.preventDefault();
        dispatch({ type: "char", char: key });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.status]);

  const setLanguage = useCallback(
    (next: Language) => dispatch({ type: "setLanguage", language: next }),
    [],
  );
  const setDuration = useCallback(
    (next: Duration) => dispatch({ type: "setDuration", duration: next }),
    [],
  );

  const elapsed = duration - state.timeLeft;
  const liveWpm =
    status === "running" && elapsed > 0
      ? computeStats(words, state.typed, elapsed).wpm
      : 0;

  return {
    ...state,
    liveWpm,
    setLanguage,
    setDuration,
    restart,
  };
}
