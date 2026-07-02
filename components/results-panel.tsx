"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Duration, Language, Stats, WpmSample } from "@/lib/types";
import { WpmChart } from "./wpm-chart";
import { ShareResults } from "./share-results";

interface ResultsPanelProps {
  stats: Stats;
  history: WpmSample[];
  bestWpm: number;
  isNewRecord: boolean;
  language: Language;
  duration: Duration;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Counts up to `value` once on mount for a satisfying reveal. */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }
    const duration = 700;
    let raf = 0;
    let startTime: number | undefined;
    const tick = (now: number) => {
      if (startTime === undefined) startTime = now;
      const progress = Math.min(1, (now - startTime) / duration);
      setDisplay(Math.round(value * easeOut(progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduceMotion]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

function Stat({
  label,
  children,
  big,
}: {
  label: string;
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-tt-sub">{label}</span>
      <span
        className={
          big
            ? "text-6xl font-semibold text-tt-main md:text-7xl"
            : "text-3xl font-semibold text-tt-main"
        }
      >
        {children}
      </span>
    </div>
  );
}

export function ResultsPanel({
  stats,
  history,
  bestWpm,
  isNewRecord,
  language,
  duration,
}: ResultsPanelProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      className="flex w-full flex-col items-center gap-8"
    >
      <div className="flex flex-wrap items-end justify-center gap-x-12 gap-y-6">
        <Stat label="wpm" big>
          <AnimatedNumber value={stats.wpm} />
        </Stat>
        <Stat label="accuracy" big>
          <AnimatedNumber value={stats.accuracy} suffix="%" />
        </Stat>
      </div>

      <div className="w-full max-w-2xl">
        <WpmChart history={history} />
      </div>

      <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-4">
        <Stat label="raw">
          <AnimatedNumber value={stats.rawWpm} />
        </Stat>
        <Stat label="characters">
          <span className="text-tt-text">
            {stats.correctChars}
            <span className="text-tt-error">/{stats.incorrectChars}</span>
          </span>
        </Stat>
        <Stat label="best">
          <AnimatedNumber value={bestWpm} />
        </Stat>
      </div>

      {isNewRecord && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 15 }}
          className="rounded-full bg-tt-main px-4 py-1 text-sm font-semibold text-tt-bg"
        >
          🏆 New personal best!
        </motion.span>
      )}

      <ShareResults stats={stats} language={language} duration={duration} />
    </motion.div>
  );
}
