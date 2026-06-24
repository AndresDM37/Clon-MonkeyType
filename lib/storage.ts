import type { Duration, Language } from "@/lib/types";

const KEY_PREFIX = "monkeytype-clone:best";

/** Best score is tracked per language + duration combination. */
function bestScoreKey(language: Language, duration: Duration): string {
  return `${KEY_PREFIX}:${language}:${duration}`;
}

export function getBestWpm(language: Language, duration: Duration): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(bestScoreKey(language, duration));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

/**
 * Persist `wpm` as the new best for this language/duration if it beats the
 * stored value. Returns true when a new record was set.
 */
export function saveBestWpm(
  language: Language,
  duration: Duration,
  wpm: number,
): boolean {
  if (typeof window === "undefined") return false;
  const current = getBestWpm(language, duration);
  if (wpm <= current) return false;
  window.localStorage.setItem(bestScoreKey(language, duration), String(wpm));
  return true;
}
