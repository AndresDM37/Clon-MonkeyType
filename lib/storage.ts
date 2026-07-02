import { DURATIONS, type Duration, type Language, type Prefs } from "@/lib/types";

const KEY_PREFIX = "monkeytype-clone:best";
const PREFS_KEY = "monkeytype-clone:prefs";

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

/** Read the persisted language/duration preferences, if any. */
export function getPrefs(): Prefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    const language: Language = parsed.language === "es" ? "es" : "en";
    const duration = DURATIONS.find((d) => d === parsed.duration);
    if (!duration) return null;
    return { language, duration };
  } catch {
    return null;
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
