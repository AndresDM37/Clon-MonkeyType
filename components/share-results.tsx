"use client";

import { useEffect, useState } from "react";
import type { Duration, Language, Stats } from "@/lib/types";
import { buildShareText, buildShareUrl } from "@/lib/share";

interface ShareResultsProps {
  stats: Stats;
  language: Language;
  duration: Duration;
}

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

function WhatsAppIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

function ShareButton({
  label,
  href,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    "flex items-center gap-2 rounded-lg bg-tt-sub/15 px-3 py-2 text-sm text-tt-sub transition-colors hover:bg-tt-sub/30 hover:text-tt-text";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span>{label}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
      <span>{label}</span>
    </button>
  );
}

export function ShareResults({ stats, language, duration }: ShareResultsProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // navigator is unavailable during SSR; detect the native share sheet here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const result = {
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    duration,
    language,
  };
  const url = buildShareUrl(result);
  const text = buildShareText(result);

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "MonkeyType Clone", text, url });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore.
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-tt-sub">
        Share your result
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {canNativeShare && (
          <ShareButton label="Share" onClick={nativeShare}>
            <ShareIcon />
          </ShareButton>
        )}
        <ShareButton
          label="WhatsApp"
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        >
          <WhatsAppIcon />
        </ShareButton>
        <ShareButton
          label="LinkedIn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        >
          <LinkedInIcon />
        </ShareButton>
        <ShareButton
          label="X"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        >
          <XIcon />
        </ShareButton>
        <ShareButton label={copied ? "Copied!" : "Copy link"} onClick={copyLink}>
          <LinkIcon />
        </ShareButton>
      </div>
    </div>
  );
}
