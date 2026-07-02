import { ImageResponse } from "next/og";

export const alt = "MonkeyType Clone — Test your typing speed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#323437",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
          <span style={{ color: "#e2b714" }}>monkey</span>
          <span style={{ color: "#d1d0c5" }}>type clone</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#646669" }}>
          Test your typing speed — WPM &amp; accuracy
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          {["15", "30", "60", "120"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "8px 22px",
                borderRadius: 12,
                backgroundColor: "rgba(226,183,20,0.15)",
                color: "#e2b714",
                fontSize: 30,
              }}
            >
              {t}s
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
