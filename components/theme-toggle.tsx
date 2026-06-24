"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const THEMES = [
  { name: "serika", label: "Serika", swatch: "#e2b714" },
  { name: "dark", label: "Dark", swatch: "#e6e6e6" },
  { name: "light", label: "Light", swatch: "#ad8701" },
  { name: "ocean", label: "Ocean", swatch: "#4cc2ff" },
  { name: "dracula", label: "Dracula", swatch: "#bd93f9" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer to the client so the active theme matches before highlighting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-2"
    >
      {THEMES.map((t) => {
        const active = mounted && theme === t.name;
        return (
          <button
            key={t.name}
            type="button"
            title={t.label}
            aria-label={`${t.label} theme`}
            aria-pressed={active}
            onClick={() => setTheme(t.name)}
            className={cn(
              "size-4 rounded-full ring-offset-2 ring-offset-tt-bg transition-transform hover:scale-125",
              active && "ring-2 ring-tt-text",
            )}
            style={{ backgroundColor: t.swatch }}
          />
        );
      })}
    </div>
  );
}
