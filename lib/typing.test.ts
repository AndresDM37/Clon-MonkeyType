import { describe, expect, it } from "vitest";
import {
  calculateAccuracy,
  calculateWpm,
  computeStats,
  generateWords,
} from "./typing";

describe("calculateWpm", () => {
  it("normalises correct characters to a full minute", () => {
    // 250 correct chars in 60s => 50 words/min.
    expect(calculateWpm(250, 60)).toBe(50);
  });

  it("respects the elapsed time (the original bug always divided by 30)", () => {
    // Same characters, different durations must give different WPM.
    expect(calculateWpm(50, 15)).toBe(40);
    expect(calculateWpm(50, 30)).toBe(20);
  });

  it("returns 0 when no time has elapsed", () => {
    expect(calculateWpm(100, 0)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("computes the percentage of correct characters", () => {
    expect(calculateAccuracy(90, 100)).toBe(90);
  });

  it("returns 100 when nothing has been typed", () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });
});

describe("computeStats", () => {
  it("counts inter-word spaces for fully typed words", () => {
    const stats = computeStats(["the", "cat"], ["the", "cat"], 60);
    // 3 + space + 3 = 7 correct chars.
    expect(stats.correctChars).toBe(7);
    expect(stats.incorrectChars).toBe(0);
    expect(stats.accuracy).toBe(100);
  });

  it("flags mistyped characters", () => {
    const stats = computeStats(["the"], ["thx"], 60);
    expect(stats.correctChars).toBe(2);
    expect(stats.incorrectChars).toBe(1);
    expect(stats.accuracy).toBe(67);
  });
});

describe("generateWords", () => {
  it("returns the requested number of real words", () => {
    const words = generateWords("en", 50);
    expect(words).toHaveLength(50);
    expect(words.every((w) => typeof w === "string" && w.length > 0)).toBe(true);
  });

  it("never runs out even when asking for more than the pool size", () => {
    expect(generateWords("es", 500)).toHaveLength(500);
  });
});
