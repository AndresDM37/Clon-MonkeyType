"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATIONS, type Duration, type Language } from "@/lib/types";
import { LANGUAGES } from "@/lib/words";

interface ConfigBarProps {
  language: Language;
  duration: Duration;
  onLanguageChange: (language: Language) => void;
  onDurationChange: (duration: Duration) => void;
  hidden: boolean;
}

interface SegmentProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

function Segment<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex items-center gap-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              active
                ? "text-tt-main"
                : "text-tt-sub hover:text-tt-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ConfigBar({
  language,
  duration,
  onLanguageChange,
  onDurationChange,
  hidden,
}: ConfigBarProps) {
  return (
    <motion.div
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -8 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg bg-tt-sub/15 px-3 py-2 text-sm"
      style={{ pointerEvents: hidden ? "none" : "auto" }}
    >
      <Segment
        ariaLabel="Test duration"
        value={duration}
        onChange={(value) => onDurationChange(value as Duration)}
        options={DURATIONS.map((d) => ({ value: d, label: String(d) }))}
      />
      <span className="h-4 w-px bg-tt-sub/40" aria-hidden />
      <Segment
        ariaLabel="Language"
        value={language}
        onChange={(value) => onLanguageChange(value as Language)}
        options={LANGUAGES}
      />
    </motion.div>
  );
}
