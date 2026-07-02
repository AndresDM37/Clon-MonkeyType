import { DURATIONS, type Duration, type Language } from "@/lib/types";

export const SITE_URL = "https://monkeytypeclon.netlify.app";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  es: "Español",
};

export interface ShareResult {
  wpm: number;
  accuracy: number;
  duration: Duration;
  language: Language;
}

/** URL of the shareable results page, e.g. /share?wpm=72&acc=96&t=30&lang=en */
export function buildShareUrl(result: ShareResult): string {
  const params = new URLSearchParams({
    wpm: String(result.wpm),
    acc: String(result.accuracy),
    t: String(result.duration),
    lang: result.language,
  });
  return `${SITE_URL}/share?${params}`;
}

/** Human-readable share message (the URL is appended separately per network). */
export function buildShareText(result: ShareResult): string {
  return (
    `⌨️ I scored ${result.wpm} WPM with ${result.accuracy}% accuracy ` +
    `(${result.duration}s · ${LANGUAGE_LABELS[result.language]}) on MonkeyType Clone! ` +
    `Can you beat me?`
  );
}

/**
 * Validate share query params coming from an arbitrary URL. Only numbers and
 * known enum values are accepted — nothing user-controlled ever reaches the
 * OG image as free text. Returns null when the params don't form a valid result.
 */
export function parseShareParams(
  params: Record<string, string | string[] | undefined>,
): ShareResult | null {
  const single = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const wpm = Number(single(params.wpm));
  const acc = Number(single(params.acc));
  const t = Number(single(params.t));
  const lang = single(params.lang);

  if (!Number.isFinite(wpm) || !Number.isFinite(acc)) return null;
  const duration = DURATIONS.find((d) => d === t);
  if (!duration) return null;
  if (lang !== "en" && lang !== "es") return null;

  return {
    wpm: Math.min(400, Math.max(0, Math.round(wpm))),
    accuracy: Math.min(100, Math.max(0, Math.round(acc))),
    duration,
    language: lang,
  };
}

export function languageLabel(language: Language): string {
  return LANGUAGE_LABELS[language];
}
