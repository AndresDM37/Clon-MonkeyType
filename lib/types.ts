export type Language = "en" | "es";

export type GameStatus = "idle" | "running" | "finished";

/** Available test durations, in seconds. */
export const DURATIONS = [15, 30, 60, 120] as const;
export type Duration = (typeof DURATIONS)[number];

export interface Stats {
  /** Net words per minute: (correct chars / 5) normalised to a minute. */
  wpm: number;
  /** Raw words per minute, counting every typed character. */
  rawWpm: number;
  /** Percentage of correctly typed characters (0–100). */
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

/** A per-second snapshot of the run, used to draw the results chart. */
export interface WpmSample {
  /** Elapsed seconds since the test started. */
  t: number;
  wpm: number;
  raw: number;
}

/** User preferences persisted between sessions. */
export interface Prefs {
  language: Language;
  duration: Duration;
}
