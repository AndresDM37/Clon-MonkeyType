"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type {
  Duration,
  GameStatus,
  Language,
  Stats,
  WpmSample,
} from "@/lib/types";
import { computeStats, generateWords } from "@/lib/typing";
import { getBestWpm, getPrefs, saveBestWpm, savePrefs } from "@/lib/storage";

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
  history: WpmSample[];
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
    history: [],
    bestWpm: 0,
    isNewRecord: false,
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
      const timeLeft = Math.max(0, state.timeLeft - 1);
      const elapsed = state.duration - timeLeft;
      const snapshot = computeStats(state.words, state.typed, elapsed);
      const history = [
        ...state.history,
        { t: elapsed, wpm: snapshot.wpm, raw: snapshot.rawWpm },
      ];

      if (timeLeft <= 0) {
        return {
          ...state,
          status: "finished",
          timeLeft: 0,
          history,
          stats: computeStats(state.words, state.typed, state.duration),
        };
      }
      return { ...state, timeLeft, history };
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
  const hydrated = useRef(false);

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

  // Load saved language/duration preferences once, on mount.
  useEffect(() => {
    const prefs = getPrefs();
    if (prefs) {
      dispatch({ type: "setLanguage", language: prefs.language });
      dispatch({ type: "setDuration", duration: prefs.duration });
    }
    hydrated.current = true;
  }, []);

  // Persist preferences on change (after the initial hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    savePrefs({ language, duration });
  }, [language, duration]);

  const setLanguage = useCallback(
    (next: Language) => dispatch({ type: "setLanguage", language: next }),
    [],
  );
  const setDuration = useCallback(
    (next: Duration) => dispatch({ type: "setDuration", duration: next }),
    [],
  );

  // --- Input handling -------------------------------------------------------
  // Desktop: physical keys via onKeyDown. Mobile: soft-keyboard edits via
  // onInput (keydown is unreliable there). preventDefault on handled keys keeps
  // the two paths from double-counting the same character.
  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.altKey) return;
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
  }, []);

  const handleInput = useCallback((event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const inputType = (event.nativeEvent as InputEvent).inputType ?? "";
    const value = input.value;
    input.value = ""; // consume the edit; state is the source of truth

    if (inputType.startsWith("delete")) {
      dispatch({ type: "backspace", whole: false });
      return;
    }
    for (const ch of value) {
      if (ch === " ") dispatch({ type: "space" });
      else dispatch({ type: "char", char: ch });
    }
  }, []);

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
    handleKeyDown,
    handleInput,
  };
}
