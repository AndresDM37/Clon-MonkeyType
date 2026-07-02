import { describe, expect, it } from "vitest";
import { buildShareText, buildShareUrl, parseShareParams } from "./share";

const RESULT = { wpm: 72, accuracy: 96, duration: 30, language: "en" } as const;

describe("buildShareUrl", () => {
  it("encodes the result as query params on /share", () => {
    expect(buildShareUrl(RESULT)).toBe(
      "https://monkeytypeclon.netlify.app/share?wpm=72&acc=96&t=30&lang=en",
    );
  });
});

describe("buildShareText", () => {
  it("mentions wpm, accuracy, duration and language", () => {
    const text = buildShareText(RESULT);
    expect(text).toContain("72 WPM");
    expect(text).toContain("96% accuracy");
    expect(text).toContain("30s · English");
  });
});

describe("parseShareParams", () => {
  it("round-trips a valid result", () => {
    expect(
      parseShareParams({ wpm: "72", acc: "96", t: "30", lang: "en" }),
    ).toEqual(RESULT);
  });

  it("clamps out-of-range numbers", () => {
    const parsed = parseShareParams({ wpm: "9999", acc: "150", t: "60", lang: "es" });
    expect(parsed).toEqual({ wpm: 400, accuracy: 100, duration: 60, language: "es" });
  });

  it.each([
    [{ wpm: "abc", acc: "96", t: "30", lang: "en" }],
    [{ wpm: "72", acc: "96", t: "31", lang: "en" }], // not a valid duration
    [{ wpm: "72", acc: "96", t: "30", lang: "fr" }], // unknown language
    [{}],
  ])("rejects invalid params %#", (params) => {
    expect(parseShareParams(params)).toBeNull();
  });
});
