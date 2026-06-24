import type { Language, Stats } from "@/lib/types";
import { WORD_POOLS } from "@/lib/words";

/** The canonical "word" length used by typing tests to normalise WPM. */
const CHARS_PER_WORD = 5;

/**
 * Fisher–Yates shuffle returning a new array (does not mutate the input).
 */
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate `count` random words for a language. The pool is reshuffled and
 * repeated as many times as needed, so the test never runs out of words.
 */
export function generateWords(language: Language, count: number): string[] {
  const pool = WORD_POOLS[language];
  const words: string[] = [];
  while (words.length < count) {
    words.push(...shuffle(pool));
  }
  return words.slice(0, count);
}

/** Net WPM: correctly typed characters divided by 5, scaled to one minute. */
export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return (correctChars / CHARS_PER_WORD) / (elapsedSeconds / 60);
}

/** Accuracy as a percentage of correctly typed characters. */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return (correctChars / totalChars) * 100;
}

/**
 * Compute the full set of stats by comparing what the user typed against the
 * target words. Only characters that were actually typed are counted; a space
 * between completed words counts as one correct character (as in MonkeyType).
 */
export function computeStats(
  words: string[],
  typed: string[],
  elapsedSeconds: number,
): Stats {
  let correctChars = 0;
  let incorrectChars = 0;

  typed.forEach((typedWord, wordIndex) => {
    const targetWord = words[wordIndex] ?? "";
    for (let i = 0; i < typedWord.length; i++) {
      if (typedWord[i] === targetWord[i]) correctChars++;
      else incorrectChars++;
    }
    // Count the space after every fully-completed, non-last typed word.
    const isLastTyped = wordIndex === typed.length - 1;
    if (!isLastTyped) correctChars++;
  });

  const totalChars = correctChars + incorrectChars;

  return {
    wpm: Math.round(calculateWpm(correctChars, elapsedSeconds)),
    rawWpm: Math.round(calculateWpm(totalChars, elapsedSeconds)),
    accuracy: Math.round(calculateAccuracy(correctChars, totalChars)),
    correctChars,
    incorrectChars,
    totalChars,
  };
}
