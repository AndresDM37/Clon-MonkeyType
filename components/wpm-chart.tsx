"use client";

import { motion, useReducedMotion } from "motion/react";
import type { WpmSample } from "@/lib/types";

interface WpmChartProps {
  history: WpmSample[];
}

const W = 600;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 26, left: 34 };

function niceMax(value: number) {
  return Math.max(20, Math.ceil(value / 20) * 20);
}

export function WpmChart({ history }: WpmChartProps) {
  const reduceMotion = useReducedMotion();

  if (history.length < 2) return null;

  const maxT = history[history.length - 1].t;
  const yMax = niceMax(Math.max(...history.map((s) => Math.max(s.wpm, s.raw))));

  const x = (t: number) =>
    PAD.left + (t / maxT) * (W - PAD.left - PAD.right);
  const y = (v: number) =>
    H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom);

  const toPath = (key: "wpm" | "raw") =>
    history
      .map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(1)} ${y(s[key]).toFixed(1)}`)
      .join(" ");

  const wpmPath = toPath("wpm");
  const rawPath = toPath("raw");
  const areaPath = `${wpmPath} L ${x(maxT).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;

  const yTicks = [0, yMax / 2, yMax];
  const xTicks = [0, Math.round(maxT / 2), maxT];
  const finalWpm = history[history.length - 1].wpm;

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Words-per-minute over ${maxT} seconds, ending at ${finalWpm} wpm.`}
      >
        {/* Horizontal grid + y labels */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              className="stroke-tt-sub/25"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-tt-sub text-[10px]"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xTicks.map((t) => (
          <text
            key={t}
            x={x(t)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            className="fill-tt-sub text-[10px]"
          >
            {t}s
          </text>
        ))}

        {/* Area under the wpm line */}
        <path d={areaPath} className="fill-tt-main/10" />

        {/* Raw wpm (secondary) */}
        <path
          d={rawPath}
          fill="none"
          className="stroke-tt-sub"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Net wpm (primary) */}
        <motion.path
          d={wpmPath}
          fill="none"
          className="stroke-tt-main"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
        />
      </svg>

      <figcaption className="mt-1 flex justify-center gap-4 text-xs text-tt-sub">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-tt-main" /> wpm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t border-dashed border-tt-sub" />{" "}
          raw
        </span>
      </figcaption>
    </figure>
  );
}
