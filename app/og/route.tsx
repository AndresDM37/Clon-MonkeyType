import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { languageLabel, parseShareParams, type ShareResult } from "@/lib/share";

export const dynamic = "force-dynamic";

const SERIKA = {
  bg: "#323437",
  main: "#e2b714",
  text: "#d1d0c5",
  sub: "#646669",
};

const ROOT_STYLE = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: SERIKA.bg,
  fontFamily: "monospace",
};

function ScoreCard({ result }: { result: ShareResult }) {
  return (
    <div style={ROOT_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          color: SERIKA.main,
        }}
      >
        <span style={{ fontSize: 150, fontWeight: 700 }}>{result.wpm}</span>
        <span style={{ fontSize: 60 }}>WPM</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 40, color: SERIKA.text }}>
        {`${result.accuracy}% accuracy · ${result.duration}s · ${languageLabel(result.language)}`}
      </div>
      <div style={{ marginTop: 56, display: "flex", fontSize: 32 }}>
        <span style={{ color: SERIKA.main }}>monkey</span>
        <span style={{ color: SERIKA.text }}>type clone</span>
        <span style={{ color: SERIKA.sub }}>&nbsp;— can you beat it?</span>
      </div>
    </div>
  );
}

function GenericCard() {
  return (
    <div style={ROOT_STYLE}>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
        <span style={{ color: SERIKA.main }}>monkey</span>
        <span style={{ color: SERIKA.text }}>type clone</span>
      </div>
      <div style={{ marginTop: 24, fontSize: 34, color: SERIKA.sub }}>
        Test your typing speed — WPM &amp; accuracy
      </div>
    </div>
  );
}

export function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const result = parseShareParams(params);

  return new ImageResponse(
    result ? <ScoreCard result={result} /> : <GenericCard />,
    { width: 1200, height: 630 },
  );
}
